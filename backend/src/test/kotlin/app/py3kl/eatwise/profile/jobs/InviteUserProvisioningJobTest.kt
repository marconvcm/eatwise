package app.py3kl.eatwise.profile.jobs

import app.py3kl.eatwise.profile.models.UserProfileInvite
import app.py3kl.eatwise.profile.models.UserProfileRequest
import app.py3kl.eatwise.profile.repositories.UserProfileInviteRepository
import app.py3kl.eatwise.profile.services.UserProfileService
import io.mockk.CapturingSlot
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull

class InviteUserProvisioningJobTest {

    private lateinit var userProfileInviteRepository: UserProfileInviteRepository
    private lateinit var userProfileService: UserProfileService
    private lateinit var job: InviteUserProvisioningJob

    @BeforeEach
    fun setUp() {
        userProfileInviteRepository = mockk()
        userProfileService = mockk()
        job = InviteUserProvisioningJob(userProfileInviteRepository, userProfileService)
    }

    @Test
    fun `should provision user for new invite`() {
        val invite = UserProfileInvite(
            id = UUID.randomUUID(),
            sourceUserId = UUID.randomUUID(),
            targetName = "New User",
            targetUserEmail = "new.user@example.com",
            createdAt = LocalDateTime.now()
        )

        val requestSlot: CapturingSlot<UserProfileRequest> = slot()
        val tokenSlot = slot<String>()

        every { userProfileInviteRepository.findAll() } returns listOf(invite)
        every { userProfileService.existsByEmail(invite.targetUserEmail) } returns false
        every { userProfileService.createUserProfile(capture(requestSlot)) } returns mockk()
        every { userProfileService.setAccessTokenForUser(invite.targetUserEmail, capture(tokenSlot)) } returns Unit
        every { userProfileInviteRepository.deleteAll(listOf(invite)) } returns Unit

        job.provisionUsersFromInvites()

        verify(exactly = 1) { userProfileService.createUserProfile(any()) }
        verify(exactly = 1) { userProfileService.setAccessTokenForUser(invite.targetUserEmail, any()) }
        verify(exactly = 1) { userProfileInviteRepository.deleteAll(listOf(invite)) }

        assertEquals(invite.targetUserEmail, requestSlot.captured.email)
        assertEquals(invite.targetName, requestSlot.captured.name)
        assertNotNull(requestSlot.captured.password)
        assertFalse(requestSlot.captured.password.isBlank())
        assertNotNull(tokenSlot.captured)
        assertFalse(tokenSlot.captured.isBlank())
    }

    @Test
    fun `should skip provisioning when user already exists`() {
        val invite = UserProfileInvite(
            id = UUID.randomUUID(),
            sourceUserId = UUID.randomUUID(),
            targetName = "Existing User",
            targetUserEmail = "existing.user@example.com",
            createdAt = LocalDateTime.now()
        )

        every { userProfileInviteRepository.findAll() } returns listOf(invite)
        every { userProfileService.existsByEmail(invite.targetUserEmail) } returns true
        every { userProfileInviteRepository.deleteAll(listOf(invite)) } returns Unit

        job.provisionUsersFromInvites()

        verify(exactly = 0) { userProfileService.createUserProfile(any()) }
        verify(exactly = 0) { userProfileService.setAccessTokenForUser(any(), any()) }
        verify(exactly = 1) { userProfileInviteRepository.deleteAll(listOf(invite)) }
    }
}
