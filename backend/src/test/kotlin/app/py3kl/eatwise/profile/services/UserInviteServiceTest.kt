package app.py3kl.eatwise.profile.services

import app.py3kl.eatwise.mail.EmailService
import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.models.UserProfileInvite
import app.py3kl.eatwise.profile.models.UserProfileInviteRequest
import app.py3kl.eatwise.profile.repositories.UserProfileInviteRepository
import io.mockk.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import reactor.core.publisher.Mono
import reactor.test.StepVerifier
import java.time.LocalDateTime
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class UserInviteServiceTest {

    private lateinit var userProfileInviteRepository: UserProfileInviteRepository
    private lateinit var emailService: EmailService
    private lateinit var userInviteService: UserInviteService

    private val testUserId = UUID.randomUUID()
    private val testInviteId = UUID.randomUUID()
    private val testTargetEmail = "test@example.com"

    @BeforeEach
    fun setUp() {
        userProfileInviteRepository = mockk()
        emailService = mockk()
        userInviteService = UserInviteService(userProfileInviteRepository, emailService)
    }

    @Test
    fun `should send invite successfully`() {
        // Given
        val userProfile = UserProfile(
            id = testUserId,
            name = "John Doe",
            email = "john@example.com",
            isAdmin = false,
            password = "hashedPassword123",
            passwordSalt = "salt123"
        )

        val inviteRequest = UserProfileInviteRequest(
            name = "Jane Doe",
            targetUserEmail = testTargetEmail,
            message = "Join me on EatWise!"
        )

        val savedInvite = UserProfileInvite(
            id = testInviteId,
            targetName = inviteRequest.name,
            sourceUserId = userProfile.id,
            targetUserEmail = testTargetEmail,
            createdAt = LocalDateTime.now()
        )

        every {
            userProfileInviteRepository.findBySourceUserIdAndTargetUserEmail(
                testUserId,
                testTargetEmail
            )
        } returns null
        every { userProfileInviteRepository.countRecentInvitesBySourceUser(testUserId, any()) } returns 0L
        every { userProfileInviteRepository.save(any<UserProfileInvite>()) } returns savedInvite
        every { emailService.sendHtmlEmailAsync(any(), any(), any(), any()) } returns Mono.empty()

        // When
        val result = userInviteService.sendInvite(userProfile, inviteRequest)

        // Then
        StepVerifier.create(result)
            .assertNext { invite ->
                assertNotNull(invite)
                assertEquals(testTargetEmail, invite.targetUserEmail)
                assertEquals(userProfile.id, invite.sourceUserId)
                assertEquals("Jane Doe", invite.targetName)
            }
            .verifyComplete()

        verify { userProfileInviteRepository.save(any<UserProfileInvite>()) }
        verify {
            emailService.sendHtmlEmailAsync(
                testTargetEmail,
                "You've been invited to join EatWise!",
                any(),
                UserInviteService.NO_REPLY_EMAIL
            )
        }
    }

    @Test
    fun `should throw exception when invite sent within cooldown period`() {
        // Given
        val userProfile = UserProfile(
            id = testUserId,
            name = "John Doe",
            email = "john@example.com",
            isAdmin = false,
            password = "hashedPassword123",
            passwordSalt = "salt123"
        )

        val inviteRequest = UserProfileInviteRequest(
            name = "Jane Doe",
            targetUserEmail = testTargetEmail,
            message = null
        )

        val existingInvite = UserProfileInvite(
            id = testInviteId,
            targetName = "Jane Doe",
            sourceUserId = testUserId,
            targetUserEmail = testTargetEmail,
            createdAt = LocalDateTime.now().minusMinutes(30)
        )

        every {
            userProfileInviteRepository.findBySourceUserIdAndTargetUserEmail(
                testUserId,
                testTargetEmail
            )
        } returns existingInvite

        // When/Then
        StepVerifier.create(userInviteService.sendInvite(userProfile, inviteRequest))
            .expectError(InviteException::class.java)
            .verify()

        verify(exactly = 0) { userProfileInviteRepository.save(any<UserProfileInvite>()) }
        verify(exactly = 0) { emailService.sendHtmlEmailAsync(any(), any(), any(), any()) }
    }

    @Test
    fun `should allow invite after cooldown period has passed`() {
        // Given
        val userProfile = UserProfile(
            id = testUserId,
            name = "John Doe",
            email = "john@example.com",
            isAdmin = false,
            password = "hashedPassword123",
            passwordSalt = "salt123"
        )

        val inviteRequest = UserProfileInviteRequest(
            name = "Jane Doe",
            targetUserEmail = testTargetEmail,
            message = null
        )

        val existingInvite = UserProfileInvite(
            id = testInviteId,
            targetName = "Jane Doe",
            sourceUserId = testUserId,
            targetUserEmail = testTargetEmail,
            createdAt = LocalDateTime.now().minusHours(2)
        )

        val savedInvite = UserProfileInvite(
            id = UUID.randomUUID(),
            targetName = inviteRequest.name,
            sourceUserId = userProfile.id,
            targetUserEmail = testTargetEmail,
            createdAt = LocalDateTime.now()
        )

        every {
            userProfileInviteRepository.findBySourceUserIdAndTargetUserEmail(
                testUserId,
                testTargetEmail
            )
        } returns existingInvite
        every { userProfileInviteRepository.countRecentInvitesBySourceUser(testUserId, any()) } returns 0L
        every { userProfileInviteRepository.save(any<UserProfileInvite>()) } returns savedInvite
        every { emailService.sendHtmlEmailAsync(any(), any(), any(), any()) } returns Mono.empty()

        // When
        val result = userInviteService.sendInvite(userProfile, inviteRequest)

        // Then
        StepVerifier.create(result)
            .assertNext { invite ->
                assertNotNull(invite)
                assertEquals(testTargetEmail, invite.targetUserEmail)
            }
            .verifyComplete()

        verify { userProfileInviteRepository.save(any<UserProfileInvite>()) }
    }

    @Test
    fun `should throw exception when exceeding rate limit`() {
        // Given
        val userProfile = UserProfile(
            id = testUserId,
            name = "John Doe",
            email = "john@example.com",
            isAdmin = false,
            password = "hashedPassword123",
            passwordSalt = "salt123"
        )

        val inviteRequest = UserProfileInviteRequest(
            name = "Jane Doe",
            targetUserEmail = testTargetEmail,
            message = null
        )

        every {
            userProfileInviteRepository.findBySourceUserIdAndTargetUserEmail(
                testUserId,
                testTargetEmail
            )
        } returns null
        every { userProfileInviteRepository.countRecentInvitesBySourceUser(testUserId, any()) } returns 5L

        // When/Then
        StepVerifier.create(userInviteService.sendInvite(userProfile, inviteRequest))
            .expectError(InviteException::class.java)
            .verify()

        verify(exactly = 0) { userProfileInviteRepository.save(any<UserProfileInvite>()) }
        verify(exactly = 0) { emailService.sendHtmlEmailAsync(any(), any(), any(), any()) }
    }

    @Test
    fun `should handle email service failure gracefully`() {
        // Given
        val userProfile = UserProfile(
            id = testUserId,
            name = "John Doe",
            email = "john@example.com",
            isAdmin = false,
            password = "hashedPassword123",
            passwordSalt = "salt123"
        )

        val inviteRequest = UserProfileInviteRequest(
            name = "Jane Doe",
            targetUserEmail = testTargetEmail,
            message = null
        )

        val savedInvite = UserProfileInvite(
            id = testInviteId,
            targetName = inviteRequest.name,
            sourceUserId = userProfile.id,
            targetUserEmail = testTargetEmail,
            createdAt = LocalDateTime.now()
        )

        every {
            userProfileInviteRepository.findBySourceUserIdAndTargetUserEmail(
                testUserId,
                testTargetEmail
            )
        } returns null
        every { userProfileInviteRepository.countRecentInvitesBySourceUser(testUserId, any()) } returns 0L
        every { userProfileInviteRepository.save(any<UserProfileInvite>()) } returns savedInvite
        every {
            emailService.sendHtmlEmailAsync(
                any(),
                any(),
                any(),
                any()
            )
        } returns Mono.error(RuntimeException("Email service unavailable"))

        // When/Then
        StepVerifier.create(userInviteService.sendInvite(userProfile, inviteRequest))
            .expectError(RuntimeException::class.java)
            .verify()

        verify { userProfileInviteRepository.save(any<UserProfileInvite>()) }
    }

    @Test
    fun `should get invites by source user`() {
        // Given
        val invites = listOf(
            UserProfileInvite(
                id = UUID.randomUUID(),
                targetName = "Jane Doe",
                sourceUserId = testUserId,
                targetUserEmail = "jane@example.com",
                createdAt = LocalDateTime.now()
            ),
            UserProfileInvite(
                id = UUID.randomUUID(),
                targetName = "Bob Smith",
                sourceUserId = testUserId,
                targetUserEmail = "bob@example.com",
                createdAt = LocalDateTime.now()
            )
        )

        every { userProfileInviteRepository.findBySourceUserId(testUserId) } returns invites

        // When
        val result = userInviteService.getInvitesBySourceUser(testUserId)

        // Then
        assertEquals(2, result.size)
        assertEquals(invites, result)
    }

    @Test
    fun `should get invites by target email`() {
        // Given
        val invites = listOf(
            UserProfileInvite(
                id = UUID.randomUUID(),
                targetName = "Jane Doe",
                sourceUserId = UUID.randomUUID(),
                targetUserEmail = testTargetEmail,
                createdAt = LocalDateTime.now()
            )
        )

        every { userProfileInviteRepository.existsByTargetUserEmail(testTargetEmail) } returns invites

        // When
        val result = userInviteService.getInvitesByTargetEmail(testTargetEmail)

        // Then
        assertEquals(1, result.size)
        assertEquals(testTargetEmail, result[0].targetUserEmail)
    }

    @Test
    fun `should include custom message in email template`() {
        // Given
        val userProfile = UserProfile(
            id = testUserId,
            name = "John Doe",
            email = "john@example.com",
            isAdmin = false,
            password = "hashedPassword123",
            passwordSalt = "salt123"
        )

        val inviteRequest = UserProfileInviteRequest(
            name = "Jane Doe",
            targetUserEmail = testTargetEmail,
            message = "Let's track our health together!"
        )

        val savedInvite = UserProfileInvite(
            id = testInviteId,
            targetName = inviteRequest.name,
            sourceUserId = userProfile.id,
            targetUserEmail = testTargetEmail,
            createdAt = LocalDateTime.now()
        )

        every {
            userProfileInviteRepository.findBySourceUserIdAndTargetUserEmail(
                testUserId,
                testTargetEmail
            )
        } returns null
        every { userProfileInviteRepository.countRecentInvitesBySourceUser(testUserId, any()) } returns 0L
        every { userProfileInviteRepository.save(any<UserProfileInvite>()) } returns savedInvite
        every { emailService.sendHtmlEmailAsync(any(), any(), any(), any()) } returns Mono.empty()

        // When
        val result = userInviteService.sendInvite(userProfile, inviteRequest)

        // Then
        StepVerifier.create(result)
            .assertNext { invite ->
                assertNotNull(invite)
            }
            .verifyComplete()

        verify {
            emailService.sendHtmlEmailAsync(
                testTargetEmail,
                any(),
                match { html ->
                    html.contains("Let's track our health together!") &&
                            html.contains("John Doe") &&
                            html.contains(testInviteId.toString())
                },
                any()
            )
        }
    }
}
