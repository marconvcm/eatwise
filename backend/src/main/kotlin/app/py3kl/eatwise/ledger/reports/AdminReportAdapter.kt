package app.py3kl.eatwise.ledger.reports

import app.py3kl.eatwise.ledger.repositories.LedgerEntryRepository
import app.py3kl.eatwise.ledger.services.LedgerReportService
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class AdminReportAdapter (
    private val ledgerEntryRepository: LedgerEntryRepository,
    private val ledgerReportService: LedgerReportService
) {
    fun getAdminReport(): AdminDashboardReport {
        val currentWeekEntries = ledgerReportService.getLastDaysEntries(7).count().toLong()

        val today = LocalDate.now()
        val previousWeekStart = today.minusDays(14)
        val previousWeekEnd = today.minusDays(8)
        val previousWeekEntries = ledgerReportService.getEntriesBetween(previousWeekStart, previousWeekEnd)
            .count().toLong()

        val percentageChange = if (previousWeekEntries > 0) {
            ((currentWeekEntries - previousWeekEntries).toDouble() / previousWeekEntries.toDouble()) * 100
        } else {
            0.0
        }

        val weeklyComparison = WeeklyComparisonReport(
            currentWeekEntries = currentWeekEntries,
            previousWeekEntries = previousWeekEntries,
            percentageChange = percentageChange
        )

        val userAveragesMap = ledgerReportService.getPeriodicUserSummary(7)
        val userAverages = userAveragesMap.map { (userId, average) ->
            UserCaloriesAverage(userId = userId, averageCalories = average)
        }

        return AdminDashboardReport(
            weeklyComparison = weeklyComparison,
            userAverages = userAverages
        )
    }

    fun getWeeklyComparison(): WeeklyComparisonReport {
        val currentWeekEntries = ledgerReportService.getLastDaysEntries(7).count().toLong()

        val today = LocalDate.now()
        val previousWeekStart = today.minusDays(14)
        val previousWeekEnd = today.minusDays(8)
        val previousWeekEntries = ledgerReportService.getEntriesBetween(previousWeekStart, previousWeekEnd)
            .count().toLong()

        val percentageChange = if (previousWeekEntries > 0) {
            ((currentWeekEntries - previousWeekEntries).toDouble() / previousWeekEntries.toDouble()) * 100
        } else {
            0.0
        }

        return WeeklyComparisonReport(
            currentWeekEntries = currentWeekEntries,
            previousWeekEntries = previousWeekEntries,
            percentageChange = percentageChange
        )
    }

    fun getUserAverages(): List<UserCaloriesAverage> {
        val userAveragesMap = ledgerReportService.getPeriodicUserSummary(7)
        return userAveragesMap.map { (userId, average) ->
            UserCaloriesAverage(userId = userId, averageCalories = average)
        }
    }
}