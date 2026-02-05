package app.py3kl.eatwise.profile.jobs

import app.py3kl.eatwise.logger
import app.py3kl.eatwise.mail.EmailService
import app.py3kl.eatwise.profile.models.UserProfileRequest
import app.py3kl.eatwise.profile.repositories.UserProfileInviteRepository
import app.py3kl.eatwise.profile.services.UserProfileService
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.security.SecureRandom
import java.util.Base64

@Component
class InviteUserProvisioningJob(
    private val userProfileInviteRepository: UserProfileInviteRepository,
    private val userProfileService: UserProfileService,
) {
    private val log = logger()

    @Scheduled(fixedDelayString = "\${app.invites.provisioning.interval-ms:300000}")
    fun provisionUsersFromInvites() {
        val invites = userProfileInviteRepository.findAll()

        invites.forEach { invite ->
            val email = invite.targetUserEmail
            if (userProfileService.existsByEmail(email)) {
                return@forEach
            }

            val password = generatePassword()
            val accessToken = generateAccessToken()

            val request = UserProfileRequest(
                email = email,
                name = invite.targetName,
                password = password
            )

            userProfileService.createUserProfile(request)
            userProfileService.setAccessTokenForUser(email, accessToken)

            // TODO: Consider sending an email to the user with their credentials and access token instead of logging it
            log.info("Provisioned user from invite for $email with password $password and access token $accessToken")
        }

        userProfileInviteRepository.deleteAll(invites)
    }

    private fun generatePassword(): String {
        val random = SecureRandom()
        val bytes = ByteArray(12)
        random.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }

    private fun generateAccessToken(): String {
        val random = SecureRandom()
        val bytes = ByteArray(48)
        random.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }
}
