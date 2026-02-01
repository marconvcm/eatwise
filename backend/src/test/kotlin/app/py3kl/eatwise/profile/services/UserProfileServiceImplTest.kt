package app.py3kl.eatwise.profile.services

import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.models.UserProfileRequest
import app.py3kl.eatwise.profile.repositories.UserProfileRepository
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.*

class UserProfileServiceImplTest {

    private lateinit var repository: UserProfileRepository
    private lateinit var service: UserProfileServiceImpl
    private var passwordEncoder: BCryptPasswordEncoder = BCryptPasswordEncoder()

    @BeforeEach
    fun setUp() {
        repository = mockk()
        service = UserProfileServiceImpl(repository, passwordEncoder)
    }

    @Test
    fun `should create user profile successfully`() {
        val request = createSampleRequest()
        val savedProfile = createSampleProfile(email = request.email, name = request.name)

        every { repository.save(any()) } returns savedProfile

        val result = service.createUserProfile(request)

        assertNotNull(result)
        assertEquals(request.name, result.name)
        assertEquals(request.email, result.email)
        verify { repository.save(any()) }
    }

    @Test
    fun `should get user profile by email`() {
        val email = "test@example.com"
        val profile = createSampleProfile(email = email)

        every { repository.findByEmail(email) } returns profile

        val result = service.getUserProfileByEmail(email)

        assertNotNull(result)
        assertEquals(email, result?.email)
        verify { repository.findByEmail(email) }
    }

    @Test
    fun `should return null when profile not found by email`() {
        val email = "nonexistent@example.com"

        every { repository.findByEmail(email) } returns null

        val result = service.getUserProfileByEmail(email)

        assertNull(result)
        verify { repository.findByEmail(email) }
    }

    @Test
    fun `should authenticate user with correct password`() {
        val email = "test@example.com"
        val password = "password123"
        val passwordSalt = "salt123"
        val profile = createSampleProfile(
            email = email,
            password = passwordEncoder.encode(password + passwordSalt) ?: "",
            passwordSalt = passwordSalt
        )

        every { repository.findByEmail(email) } returns profile

        val result = service.authenticateUser(email, password)

        assertTrue(result)
        verify { repository.findByEmail(email) }
    }

    @Test
    fun `should fail authentication with incorrect password`() {
        val email = "test@example.com"
        val correctPassword = "password123"
        val wrongPassword = "wrongpassword"
        val profile = createSampleProfile(email = email, password = correctPassword)

        every { repository.findByEmail(email) } returns profile

        val result = service.authenticateUser(email, wrongPassword)

        assertFalse(result)
        verify { repository.findByEmail(email) }
    }

    @Test
    fun `should fail authentication when user not found`() {
        val email = "nonexistent@example.com"
        val password = "password123"

        every { repository.findByEmail(email) } returns null

        val result = service.authenticateUser(email, password)

        assertFalse(result)
        verify { repository.findByEmail(email) }
    }

    private fun createSampleRequest(
        email: String = "test@example.com",
        name: String = "Test User",
        password: String = "password123"
    ) = UserProfileRequest(
        email = email,
        name = name,
        password = password
    )

    private fun createSampleProfile(
        id: UUID = UUID.randomUUID(),
        name: String = "Test User",
        email: String = "test@example.com",
        password: String = "hashedPassword",
        passwordSalt: String = "salt123",
        isAdmin: Boolean = false
    ) = UserProfile(
        id = id,
        name = name,
        email = email,
        password = password,
        passwordSalt = passwordSalt,
        isAdmin = isAdmin
    )
}
