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

class LedgerEntryServiceImplAdminTest {

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
            calories = 350.0,
            subject = "Updated",
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
        val updateRequest = LedgerEntryRequest(
            calories = 350.0,
            subject = "Updated",
            registrationDate = LocalDateTime.now()
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
}
