package app.py3kl.eatwise.ledger.reports

data class WeeklyComparisonReport(
    val currentWeekEntries: Long,
    val previousWeekEntries: Long,
    val percentageChange: Double
)