package app.py3kl.eatwise.ledger.services

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.models.LedgerEntryRequest
import app.py3kl.eatwise.ledger.repositories.LedgerEntryRepository
import app.py3kl.eatwise.profile.models.UserProfile
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import java.util.*

class LedgerEntryServiceImplTest {

    private lateinit var repository: LedgerEntryRepository
    private lateinit var service: LedgerEntryServiceImpl
    private lateinit var userProfile: UserProfile

    @BeforeEach
    fun setUp() {
        repository = mockk()
        service = LedgerEntryServiceImpl(repository)
        userProfile = createSampleUserProfile()
    }

    @Test
    fun `should create ledger entry successfully`() {
        val request = createSampleRequest()
        val entry = createSampleEntry()
        every { repository.save(any()) } returns entry

        val result = service.createEntry(userProfile, request, false)

        assertNotNull(result)
        assertEquals(entry.calories, result.calories)
        verify { repository.save(any()) }
    }

    @Test
    fun `should get all entries for user`() {
        val entries = listOf(createSampleEntry(), createSampleEntry())
        every { repository.findByUserId(userProfile.id) } returns entries

        val result = service.getAllEntries(userProfile, false)

        assertEquals(2, result.count())
        verify { repository.findByUserId(userProfile.id) }
    }

    @Test
    fun `should update ledger entry successfully`() {
        val id = UUID.randomUUID()
        val existingEntry = createSampleEntry(id)
        val updatedEntry = existingEntry.copy(calories = 300.0)
        val updateRequest = LedgerEntryRequest(
            calories = 300.0,
            subject = existingEntry.subject,
            registrationDate = existingEntry.registrationDate
        )

        every { repository.findByIdAndUserId(id, userProfile.id) } returns existingEntry
        every { repository.save(any()) } returns updatedEntry

        val result = service.updateEntry(userProfile, id, updateRequest, false)

        assertNotNull(result)
        assertEquals(300.0, result?.calories)
        verify { repository.save(any()) }
    }

    @Test
    fun `should return null when updating non-existent entry`() {
        val id = UUID.randomUUID()
        val entry = createSampleEntry(id)
        val updateRequest = LedgerEntryRequest(
            calories = 300.0,
            subject = entry.subject,
            registrationDate = entry.registrationDate
        )

        every { repository.findByIdAndUserId(id, userProfile.id) } returns null

        val result = service.updateEntry(userProfile, id, updateRequest, false)

        assertNull(result)
        verify(exactly = 0) { repository.save(any()) }
    }

    @Test
    fun `should delete ledger entry successfully`() {
        val id = UUID.randomUUID()
        val entry = createSampleEntry(id)

        every { repository.findByIdAndUserId(id, userProfile.id) } returns entry
        every { repository.deleteById(id) } returns Unit

        val result = service.deleteEntry(userProfile, id, false)

        assertTrue(result)
        verify { repository.deleteById(id) }
    }

    @Test
    fun `should return false when deleting non-existent entry`() {
        val id = UUID.randomUUID()

        every { repository.findByIdAndUserId(id, userProfile.id) } returns null

        val result = service.deleteEntry(userProfile, id, false)

        assertFalse(result)
        verify(exactly = 0) { repository.deleteById(any()) }
    }

    @Test
    fun `admin should create entry for another user when request contains userId and isAdminRequest true`() {
        val adminProfile = createAdminUserProfile()
        val otherUserId = UUID.randomUUID()
        val request = createSampleRequestWithUser(otherUserId)
        val savedEntry = LedgerEntry(
            id = UUID.randomUUID(),
            userId = otherUserId,
            calories = request.calories,
            subject = request.subject,
            registrationDate = request.registrationDate
        )

        every { repository.save(any()) } returns savedEntry

        val result = service.createEntry(adminProfile, request, true)

        assertNotNull(result)
        assertEquals(otherUserId, result.userId)
        verify { repository.save(any()) }
    }

    @Test
    fun `admin should get all entries when isAdminRequest true`() {
        val adminProfile = createAdminUserProfile()
        val entries = listOf(
            LedgerEntry(id = UUID.randomUUID(), userId = UUID.randomUUID(), calories = 100.0, subject = "A", registrationDate = LocalDateTime.now()),
            LedgerEntry(id = UUID.randomUUID(), userId = UUID.randomUUID(), calories = 200.0, subject = "B", registrationDate = LocalDateTime.now())
        )
        every { repository.findAll() } returns entries

        val result = service.getAllEntries(adminProfile, true)

        assertEquals(2, result.count())
        verify { repository.findAll() }
    }

    @Test
    fun `admin should update entry across users when isAdminRequest true`() {
        val adminProfile = createAdminUserProfile()
        val id = UUID.randomUUID()
        val existingEntry = LedgerEntry(id = id, userId = UUID.randomUUID(), calories = 150.0, subject = "Old", registrationDate = LocalDateTime.now())
        val updatedEntry = existingEntry.copy(calories = 350.0)
        val updateRequest = LedgerEntryRequest(
            calories = 300.0,
            subject = existingEntry.subject,
            registrationDate = existingEntry.registrationDate
        )

        every { repository.findById(id) } returns Optional.of(existingEntry)
        every { repository.save(any()) } returns updatedEntry

        val result = service.updateEntry(adminProfile, id, updateRequest, true)

        assertNotNull(result)
        assertEquals(350.0, result?.calories)
        verify { repository.save(any()) }
    }

    @Test
    fun `admin update should return null when entry does not exist across users`() {
        val adminProfile = createAdminUserProfile()
        val id = UUID.randomUUID()
        val entry = LedgerEntry(id = id, userId = UUID.randomUUID(), calories = 100.0, subject = "X", registrationDate = LocalDateTime.now())
        val updateRequest = LedgerEntryRequest(
            calories = 200.0,
            subject = entry.subject,
            registrationDate = entry.registrationDate
        )

        every { repository.findById(id) } returns Optional.empty()

        val result = service.updateEntry(adminProfile, id, updateRequest, true)

        assertNull(result)
        verify(exactly = 0) { repository.save(any()) }
    }

    @Test
    fun `admin should delete entry across users when isAdminRequest true`() {
        val adminProfile = createAdminUserProfile()
        val id = UUID.randomUUID()
        val entry = LedgerEntry(id = id, userId = UUID.randomUUID(), calories = 120.0, subject = "Del", registrationDate = LocalDateTime.now())

        every { repository.findById(id) } returns Optional.of(entry)
        every { repository.deleteById(id) } returns Unit

        val result = service.deleteEntry(adminProfile, id, true)

        assertTrue(result)
        verify { repository.deleteById(id) }
    }

    @Test
    fun `admin delete should return false when entry does not exist across users`() {
        val adminProfile = createAdminUserProfile()
        val id = UUID.randomUUID()

        every { repository.findById(id) } returns Optional.empty()

        val result = service.deleteEntry(adminProfile, id, true)

        assertFalse(result)
        verify(exactly = 0) { repository.deleteById(any()) }
    }

    private fun createSampleUserProfile() = UserProfile(
        id = UUID.randomUUID(),
        name = "Test User",
        email = "test@example.com",
        isAdmin = false,
        password = "password123",
        passwordSalt = "salt"
    )

    private fun createAdminUserProfile() = UserProfile(
        id = UUID.randomUUID(),
        name = "Admin User",
        email = "admin@example.com",
        isAdmin = true,
        password = "adminpass",
        passwordSalt = "salt"
    )

    private fun createSampleRequest() = LedgerEntryRequest(
        calories = 250.0,
        subject = "Lunch",
        registrationDate = LocalDateTime.now()
    )

    private fun createSampleRequestWithUser(userId: UUID) = LedgerEntryRequest(
        calories = 250.0,
        subject = "Lunch",
        registrationDate = LocalDateTime.now(),
        userId = userId
    )

    private fun createSampleEntry(id: UUID = UUID.randomUUID()) = LedgerEntry(
        id = id,
        userId = userProfile.id,
        calories = 250.0,
        subject = "Lunch",
        registrationDate = LocalDateTime.now()
    )
}
