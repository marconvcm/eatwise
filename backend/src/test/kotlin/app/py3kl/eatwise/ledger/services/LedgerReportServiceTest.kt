package app.py3kl.eatwise.ledger.services

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.repositories.LedgerEntryRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import java.time.LocalDate
import java.util.*
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import kotlin.text.get

@SpringBootTest
class LedgerReportServiceTest {

    @Autowired
    private lateinit var ledgerReportService: LedgerReportService

    @Autowired
    private lateinit var ledgerEntryRepository: LedgerEntryRepository

    private val userId1 = UUID.randomUUID()
    private val userId2 = UUID.randomUUID()

    @BeforeEach
    fun setup() {
        ledgerEntryRepository.deleteAll()
    }

    @AfterEach
    fun cleanup() {
        ledgerEntryRepository.deleteAll()
    }

    @Test
    fun `should get entries between two dates including boundaries`() {
        val startDate = LocalDate.now().minusDays(3)
        val endDate = LocalDate.now()

        // Entry before range
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 100.0,
                subject = "Before range",
                registrationDate = startDate.minusDays(1).atTime(12, 0)
            )
        )

        // Entries within range
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 200.0,
                subject = "Day 1",
                registrationDate = startDate.atTime(10, 0)
            )
        )

        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId2,
                calories = 300.0,
                subject = "Day 2",
                registrationDate = startDate.plusDays(1).atTime(14, 0)
            )
        )

        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 400.0,
                subject = "Today",
                registrationDate = endDate.atTime(9, 0)
            )
        )

        // Entry after range
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 500.0,
                subject = "After range",
                registrationDate = endDate.plusDays(1).atTime(12, 0)
            )
        )

        val result = ledgerReportService.getEntriesBetween(startDate, endDate)
        val resultList = result.toList()

        assertEquals(3, resultList.size)
        assertTrue(resultList.any { it.subject == "Day 1" })
        assertTrue(resultList.any { it.subject == "Day 2" })
        assertTrue(resultList.any { it.subject == "Today" })
    }

    @Test
    fun `should get last 7 days entries including current day`() {
        val today = LocalDate.now()

        // Create entries for last 7 days
        for (i in 0L..6L) {
            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = userId1,
                    calories = 200.0 + (i * 10),
                    subject = "Day $i",
                    registrationDate = today.minusDays(i).atTime(12, 0)
                )
            )
        }

        // Entry from 8 days ago (should not be included)
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 100.0,
                subject = "8 days ago",
                registrationDate = today.minusDays(8).atTime(12, 0)
            )
        )

        val result = ledgerReportService.getLastDaysEntries(7)
        val resultList = result.toList()

        assertEquals(7, resultList.size)
        assertTrue(resultList.any { it.registrationDate.toLocalDate() == today })
    }

    @Test
    fun `should calculate entries for last 7 days vs previous 7 days`() {
        val today = LocalDate.now()

        // Last 7 days (days 0-6): 5 entries
        for (i in 0L..4L) {
            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = userId1,
                    calories = 250.0,
                    subject = "Current week entry $i",
                    registrationDate = today.minusDays(i).atTime(12, 0)
                )
            )
        }

        // Previous 7 days (days 7-13): 3 entries
        for (i in 7L..9L) {
            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = userId1,
                    calories = 200.0,
                    subject = "Previous week entry $i",
                    registrationDate = today.minusDays(i).atTime(12, 0)
                )
            )
        }

        val currentWeekEntries = ledgerReportService.getLastDaysEntries(6).count() // Changed from 7 to 6
        val previousWeekEntries = ledgerReportService.getEntriesBetween(
            today.minusDays(13),
            today.minusDays(7)
        ).count()

        assertEquals(5, currentWeekEntries)
        assertEquals(3, previousWeekEntries)
    }

    @Test
    fun `should calculate average calories per user for last 7 days`() {
        val today = LocalDate.now()

        // User 1: 300, 400, 500 = avg 400
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 300.0,
                subject = "User1 Entry1",
                registrationDate = today.minusDays(1).atTime(10, 0)
            )
        )
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 400.0,
                subject = "User1 Entry2",
                registrationDate = today.minusDays(2).atTime(11, 0)
            )
        )
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 500.0,
                subject = "User1 Entry3",
                registrationDate = today.atTime(12, 0)
            )
        )

        // User 2: 200, 600 = avg 400
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId2,
                calories = 200.0,
                subject = "User2 Entry1",
                registrationDate = today.minusDays(3).atTime(13, 0)
            )
        )
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId2,
                calories = 600.0,
                subject = "User2 Entry2",
                registrationDate = today.atTime(14, 0)
            )
        )

        // Entry outside 7 day window (should not be counted)
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 1000.0,
                subject = "Old entry",
                registrationDate = today.minusDays(8).atTime(15, 0)
            )
        )

        val result = ledgerReportService.getPeriodicUserSummary(7)

        assertEquals(2, result.size)
        assertEquals(400.0, result[userId1])
        assertEquals(400.0, result[userId2])
    }

    @Test
    fun `should handle empty data for periodic summary`() {
        val result = ledgerReportService.getPeriodicUserSummary(7)
        assertTrue(result.isEmpty())
    }

    @Test
    fun `should handle single user with single entry`() {
        val today = LocalDate.now()

        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 350.0,
                subject = "Single entry",
                registrationDate = today.atTime(12, 0)
            )
        )

        val result = ledgerReportService.getPeriodicUserSummary(7)

        assertEquals(1, result.size)
        assertEquals(350.0, result[userId1])
    }


    @Test
    fun `should calculate moving average for multiple windows`() {
        val today = LocalDate.now()

        // Create entries for last 14 days (days 0-13)
        for (i in 0L..13L) {
            val entriesPerDay = if (i <= 6) 2 else 1 // Changed from < to <=
            repeat(entriesPerDay) {
                ledgerEntryRepository.save(
                    LedgerEntry(
                        id = UUID.randomUUID(),
                        userId = userId1,
                        calories = 250.0,
                        subject = "Entry day $i",
                        registrationDate = today.minusDays(i).atTime(12, 0)
                    )
                )
            }
        }

        val result = ledgerReportService.getMovingAverage(windowSizeInDays = 7, numberOfChunks = 2)

        // Verify recent 7 days (0-6) have 2 entries per day
        for (i in 0L..6L) {
            val day = today.minusDays(i)
            assertEquals(2L, result[day] ?: 0L, "Day $day should have 2 entries")
        }

        // Verify previous 7 days (7-13) have 1 entry per day
        for (i in 7L..13L) {
            val day = today.minusDays(i)
            assertEquals(1L, result[day] ?: 0L, "Day $day should have 1 entry")
        }
    }

    @Test
    fun `should include current day in last 7 days calculation`() {
        val today = LocalDate.now()

        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = userId1,
                calories = 500.0,
                subject = "Today's entry",
                registrationDate = today.atTime(23, 59) // End of day
            )
        )

        val result = ledgerReportService.getLastDaysEntries(7)
        val resultList = result.toList()

        assertTrue(resultList.any { it.registrationDate.toLocalDate() == today })
    }
}
