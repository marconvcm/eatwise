package app.py3kl.eatwise.profile.repositories

import app.py3kl.eatwise.profile.models.UserProfileInvite
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface UserProfileInviteRepository : CrudRepository<UserProfileInvite, UUID> {
    fun existsByTargetUserEmail(targetUserEmail: String): List<UserProfileInvite>
    fun findBySourceUserId(sourceUserId: UUID): List<UserProfileInvite>
    fun findBySourceUserIdAndTargetUserEmail(sourceUserId: UUID, targetUserEmail: String): UserProfileInvite?

    @Query("SELECT COUNT(i) FROM UserProfileInvite i WHERE i.sourceUserId = :sourceUserId AND i.createdAt > :since")
    fun countRecentInvitesBySourceUser(sourceUserId: UUID, since: LocalDateTime): Long
}