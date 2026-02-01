package app.py3kl.eatwise.profile.models

import jakarta.validation.constraints.Email

data class UserProfileInviteRequest(
    val name: String,
    @field:Email(message = "Invalid email format")
    val targetUserEmail: String,
    val message: String? = null
)