package app.py3kl.eatwise.profile.models

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import org.hibernate.validator.constraints.Length


data class UserProfileRequest(
    @field:Email(message = "Invalid email format")
    val email: String,
    @field:NotBlank(message = "Name cannot be blank")
    @field:Pattern(
        regexp = "^[a-zA-ZÀ-ÿ '-]+$",
        message = "Name can only contain letters, spaces, apostrophes, and hyphens"
    )
    val name: String,
    @field:Length(min = 8, message = "Password must be at least 8 characters long")
    val password: String,
    @field:Min(0, message = "Kcal threshold must be non-negative")
    val kcalThreshold: Long = 2100,
)