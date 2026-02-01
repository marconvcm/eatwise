package app.py3kl.eatwise.profile.services

import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.models.UserProfileRequest
import app.py3kl.eatwise.profile.repositories.UserProfileRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.util.*

@Service
class UserProfileServiceImpl(
    private val userProfileRepository: UserProfileRepository,
    private val passwordEncoder: PasswordEncoder
) : UserProfileService {

    override fun existsByEmail(email: String): Boolean {
        return userProfileRepository.existsByEmail(email)
    }

    override fun getUserProfileByEmail(email: String): UserProfile? {
        return userProfileRepository.findByEmail(email)
    }

    override fun getUserProfileByAccessToken(accessToken: String): UserProfile? {
        return userProfileRepository.findByAccessToken(accessToken)
    }

    override fun authenticateUser(email: String, password: String): Boolean {
        val userProfile = userProfileRepository.findByEmail(email) ?: return false
        return passwordEncoder.matches(password + userProfile.passwordSalt, userProfile.password)
    }

    override fun createUserProfile(userProfile: UserProfileRequest): UserProfile {
        return createUserProfile(userProfile, isAdmin = false)
    }

    override fun createAdminUserProfile(userProfile: UserProfileRequest): UserProfile {
        return createUserProfile(userProfile, isAdmin = true)
    }

    override fun authenticateByAccessToken(accessToke: String): Boolean {
        return userProfileRepository.existsByAccessToken(accessToke)
    }

    override fun setAccessTokenForUser(email: String, accessToken: String) {
        val userProfile = userProfileRepository.findByEmail(email)
            ?: throw IllegalArgumentException("User with email $email not found")

        val updatedProfile = userProfile.copy(accessToken = accessToken)
        userProfileRepository.save(updatedProfile)
    }

    private fun createUserProfile(userProfile: UserProfileRequest, isAdmin: Boolean): UserProfile {
        val salt = generateSalt()
        val hashedPassword = passwordEncoder.encode(userProfile.password + salt)
            ?: throw IllegalStateException("Password hashing failed")

        val newProfile = UserProfile(
            id = UUID.randomUUID(),
            name = userProfile.name,
            email = userProfile.email,
            password = hashedPassword,
            passwordSalt = salt,
            isAdmin = isAdmin
        )

        return userProfileRepository.save(newProfile)
    }

    private fun generateSalt(): String {
        val random = SecureRandom()
        val salt = ByteArray(16)
        random.nextBytes(salt)
        return Base64.getEncoder().encodeToString(salt)
    }
}
