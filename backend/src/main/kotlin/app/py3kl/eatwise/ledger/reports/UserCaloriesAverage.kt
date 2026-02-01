package app.py3kl.eatwise.ledger.reports

import java.util.UUID

data class UserCaloriesAverage(
    val userId: UUID,
    val averageCalories: Double
)