package app.py3kl.eatwise.profile.models

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.util.*

@Entity
@Table(
    name = "users_profile", indexes = [
        Index(name = "idx_user_email", columnList = "email", unique = true),
        Index(name = "idx_user_access_token", columnList = "access_token", unique = true)
    ]
)
data class UserProfile(
    @Id
    val id: UUID,
    @field:NotBlank(message = "Name cannot be blank")
    val name: String,
    @field:Email(message = "Invalid email format")
    val email: String,
    @field:Min(0, message = "Kcal threshold must be non-negative")
    val kcalThreshold: Long = 2100,
    val isAdmin: Boolean = false,
    @JsonIgnore
    val password: String = "",
    @JsonIgnore
    val passwordSalt: String = "",
    @JsonIgnore
    @Column(name = "access_token", unique = true, nullable = true)
    val accessToken: String? = null
)
