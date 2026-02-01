package app.py3kl.eatwise.profile.models

import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import org.springframework.data.annotation.CreatedDate
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(
    name = "user_profile_invites", indexes = [
        Index(name = "idx_target_user_email", columnList = "target_user_email"),
        Index(name = "idx_source_user_id", columnList = "source_user_id")
    ]
)
data class UserProfileInvite(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(name = "source_user_id")
    val sourceUserId: UUID,
    @NotBlank
    @Column(name = "taget_name")
    val targetName: String,
    @Column(name = "target_user_email")
    @field:Email(message = "Invalid email format")
    val targetUserEmail: String,
    val message: String? = null,
    @CreatedDate
    val createdAt: LocalDateTime
)

