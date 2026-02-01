package app.py3kl.eatwise.ledger.reports

data class AdminDashboardReport(
    val weeklyComparison: WeeklyComparisonReport,
    val userAverages: List<UserCaloriesAverage>
)