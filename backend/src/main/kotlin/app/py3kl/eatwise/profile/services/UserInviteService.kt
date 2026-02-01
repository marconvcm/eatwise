package app.py3kl.eatwise.profile.services

import app.py3kl.eatwise.mail.EmailService
import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.models.UserProfileInvite
import app.py3kl.eatwise.profile.models.UserProfileInviteRequest
import app.py3kl.eatwise.profile.repositories.UserProfileInviteRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.time.LocalDateTime
import java.util.UUID

class InviteException(message: String) : RuntimeException(message)

@Service
class UserInviteService(
    private val userProfileInviteRepository: UserProfileInviteRepository,
    private val emailService: EmailService
) {
    private val logger = LoggerFactory.getLogger(UserInviteService::class.java)

    companion object {
        const val MAX_INVITES_PER_HOUR = 5
        const val INVITE_COOLDOWN_HOURS = 1L
        const val NO_REPLY_EMAIL = "noreply@eatwise.app"
    }

    fun sendInvite(profile: UserProfile, inviteRequest: UserProfileInviteRequest): Mono<UserProfileInvite> {
        return Mono.fromCallable {
            validateInvite(profile.id, inviteRequest.targetUserEmail)

            val invite = UserProfileInvite(
                id = UUID.randomUUID(),
                targetName = inviteRequest.name,
                sourceUserId = profile.id,
                targetUserEmail = inviteRequest.targetUserEmail,
                createdAt = LocalDateTime.now()
            )

            userProfileInviteRepository.save(invite)
        }.flatMap { invite ->
            sendInviteEmail(invite.targetUserEmail, profile, inviteRequest, invite.id)
                .thenReturn(invite)
                .doOnSuccess { logger.info("Invite sent successfully from ${profile.id} to ${invite.targetUserEmail}") }
                .doOnError { logger.error("Failed to send invite email to ${invite.targetUserEmail}", it) }
        }
    }

    private fun validateInvite(sourceUserId: UUID, targetUserEmail: String) {
        // Check if user already sent invite to this email
        val existingInvite = userProfileInviteRepository
            .findBySourceUserIdAndTargetUserEmail(sourceUserId, targetUserEmail)

        if (existingInvite != null) {
            val hoursSinceLastInvite = java.time.Duration.between(
                existingInvite.createdAt,
                LocalDateTime.now()
            ).toHours()

            if (hoursSinceLastInvite < INVITE_COOLDOWN_HOURS) {
                throw InviteException(
                    "You already sent an invite to this email. Please wait at least 1 hour before sending another."
                )
            }
        }

        // Check rate limit (max 5 invites per hour)
        val oneHourAgo = LocalDateTime.now().minusHours(1)
        val recentInvitesCount = userProfileInviteRepository
            .countRecentInvitesBySourceUser(sourceUserId, oneHourAgo)

        if (recentInvitesCount >= MAX_INVITES_PER_HOUR) {
            throw InviteException(
                "You have exceeded the maximum number of invites (5) per hour. Please try again later."
            )
        }
    }

    private fun sendInviteEmail(
        targetEmail: String,
        profile: UserProfile,
        inviteRequest: UserProfileInviteRequest,
        inviteId: UUID
    ): Mono<Void> {
        val subject = "You've been invited to join EatWise!"
        val htmlContent = buildInviteEmailTemplate(targetEmail, profile, inviteRequest, inviteId)

        return emailService.sendHtmlEmailAsync(
            to = targetEmail,
            subject = subject,
            htmlContent = htmlContent,
            from = NO_REPLY_EMAIL
        )
    }

    private fun buildInviteEmailTemplate(
        targetEmail: String,
        profile: UserProfile,
        inviteRequest: UserProfileInviteRequest,
        inviteId: UUID
    ): String {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    background: #f9f9f9;
                    padding: 30px;
                    border-radius: 0 0 10px 10px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }
                .invite-from {
                    background: #e8eaf6;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🍎 EatWise Invitation</h1>
            </div>
            <div class="content">
                <h2>You've been invited!</h2>
                <p>Hello ${inviteRequest.name},</p>
                <div class="invite-from">
                    <strong>${profile.name}</strong> has invited you to join EatWise!
                    ${inviteRequest.message?.let { "<p><em>\"$it\"</em></p>" } ?: ""}
                </div>
                <p><strong>EatWise</strong> is the smart calorie tracking application that helps you maintain a healthy lifestyle.</p>
                <p>With EatWise, you can:</p>
                <ul>
                    <li>📊 Track your daily calorie intake</li>
                    <li>🎯 Set and monitor your calorie goals</li>
                    <li>📈 View detailed reports and insights</li>
                    <li>⏰ Get notified when you exceed your limits</li>
                </ul>
                <center>
                    <a href="https://eatwise.app/register?email=${targetEmail}&refId=${inviteId}" class="button">
                        Join EatWise Now
                    </a>
                </center>
                <p>Start your journey to better health today!</p>
            </div>
            <div class="footer">
                <p>This invitation was sent to ${targetEmail}</p>
                <p>&copy; 2025 EatWise. All rights reserved.</p>
            </div>
        </body>
        </html>
    """.trimIndent()
    }


    fun getInvitesBySourceUser(sourceUserId: UUID): List<UserProfileInvite> {
        return userProfileInviteRepository.findBySourceUserId(sourceUserId)
    }

    fun getInvitesByTargetEmail(targetEmail: String): List<UserProfileInvite> {
        return userProfileInviteRepository.existsByTargetUserEmail(targetEmail)
    }
}