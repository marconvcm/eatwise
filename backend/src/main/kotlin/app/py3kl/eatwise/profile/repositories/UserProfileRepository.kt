package app.py3kl.eatwise.profile.repositories

import app.py3kl.eatwise.profile.models.UserProfile
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Component
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface UserProfileRepository : CrudRepository<UserProfile, UUID> {

    fun existsByEmail(email: String): Boolean

    fun findByEmail(email: String): UserProfile?

    fun existsByAccessToken(accessToken: String): Boolean

    fun findByAccessToken(accessToken: String): UserProfile?
}

