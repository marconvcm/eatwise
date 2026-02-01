package app.py3kl.eatwise.ledger.models

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.PastOrPresent
import jakarta.validation.constraints.Positive
import java.time.LocalDateTime
import java.util.UUID

data class LedgerEntryRequest(
    @field:Positive(message = "Calories must be a positive number")
    val calories: Double,
    @field:NotBlank(message = "Subject cannot be blank")
    val subject: String,
    @field:PastOrPresent(message = "Registration date cannot be in the future")
    val registrationDate: LocalDateTime,
    val userId: UUID? = null
)