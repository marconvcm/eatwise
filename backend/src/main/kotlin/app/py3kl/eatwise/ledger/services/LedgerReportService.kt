package app.py3kl.eatwise.ledger.services

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.repositories.LedgerEntryRepository
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*
import kotlin.text.get
import kotlin.text.toLong

@Service
class LedgerReportService(
    val ledgerEntryRepository: LedgerEntryRepository
) {

    fun getEntriesBetween(startDate: LocalDate, endDate: LocalDate): Iterable<LedgerEntry> {
        return ledgerEntryRepository.findByRegistrationDateBetween(
            startDate.atTime(0, 0, 0),
            endDate.atTime(23, 59, 59)
        )
    }

    fun getLastDaysEntries(days: Long): Iterable<LedgerEntry> {
        val today = LocalDate.now()
        val startDate = today.minusDays(days)
        return getEntriesBetween(startDate, today)
    }

    fun getMovingAverage(windowSizeInDays: Long, numberOfChunks: Long): Map<LocalDate, Long> {
        val result = mutableMapOf<LocalDate, Long>()
        val today = LocalDate.now()
        val totalDays = windowSizeInDays * numberOfChunks - 1 // Subtract 1 to include today

        val startDate = today.minusDays(totalDays)

        val entries = getEntriesBetween(startDate, today)
            .groupBy { it.registrationDate.toLocalDate() }

        for (i in 0..totalDays) { // Changed to 0..totalDays to include all days
            val day = startDate.plusDays(i)
            result[day] = (entries[day] ?: emptyList()).count().toLong()
        }

        return result
    }

    fun getPeriodicUserSummary(windowSizeInDays: Long): Map<UUID, Double> {

        val entries = getLastDaysEntries(windowSizeInDays).groupBy { it.userId }

        val result = mutableMapOf<UUID, Double>()
        for ((userId, userEntries) in entries) {
            result[userId] = userEntries.fold(0.0) { acc, entry ->
                acc + entry.calories
            } / userEntries.size.toDouble()
        }

        return result
    }
}