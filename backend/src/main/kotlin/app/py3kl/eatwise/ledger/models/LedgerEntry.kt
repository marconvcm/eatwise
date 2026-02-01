package app.py3kl.eatwise.ledger.models

import jakarta.persistence.*
import jakarta.validation.constraints.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(
    name = "ledger", indexes = [
        Index(name = "idx_user_id", columnList = "user_id")
    ]
)
data class LedgerEntry(
    @Id
    val id: UUID,
    @field:NotNull(message = "User ID cannot be null")
    @field:Column(nullable = false, name = "user_id")
    val userId: UUID,
    @field:Positive(message = "Calories must be a positive number")
    val calories: Double,
    @field:NotBlank(message = "Subject cannot be blank")
    val subject: String,
    val registrationDate: LocalDateTime
)


