package app.py3kl.eatwise.e2e

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.repositories.LedgerEntryRepository
import app.py3kl.eatwise.ledger.reports.AdminDashboardReport
import app.py3kl.eatwise.ledger.reports.UserCaloriesAverage
import app.py3kl.eatwise.ledger.reports.WeeklyComparisonReport
import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.repositories.UserProfileRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody
import java.time.LocalDate
import java.util.*

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class AdminReportControllerIntegrationTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @Autowired
    private lateinit var ledgerEntryRepository: LedgerEntryRepository

    @Autowired
    private lateinit var userProfileRepository: UserProfileRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    private lateinit var adminUser: UserProfile
    private lateinit var regularUser: UserProfile
    private lateinit var testUser1: UserProfile
    private lateinit var testUser2: UserProfile

    private val adminUsername = "testAdmin@example.com"
    private val regularUsername = "testUser@example.com"
    private val testPassword = "password123"
    private val testPasswordSalt = "somesalt"

    @BeforeEach
    fun setup() {
        adminUser = userProfileRepository.save(
            UserProfile(
                id = UUID.randomUUID(),
                email = adminUsername,
                password = passwordEncoder.encode(testPassword + testPasswordSalt) ?: "",
                name = "Admin User",
                passwordSalt = testPasswordSalt,
                isAdmin = true
            )
        )

        regularUser = userProfileRepository.save(
            UserProfile(
                id = UUID.randomUUID(),
                email = regularUsername,
                password = passwordEncoder.encode(testPassword + testPasswordSalt) ?: "",
                name = "Regular User",
                passwordSalt = testPasswordSalt,
                isAdmin = false
            )
        )

        testUser1 = userProfileRepository.save(
            UserProfile(
                id = UUID.randomUUID(),
                email = "testUser1@example.com",
                password = passwordEncoder.encode(testPassword + testPasswordSalt) ?: "",
                name = "Test User 1",
                passwordSalt = testPasswordSalt,
                isAdmin = false
            )
        )

        testUser2 = userProfileRepository.save(
            UserProfile(
                id = UUID.randomUUID(),
                email = "testUser2@example.com",
                password = passwordEncoder.encode(testPassword + testPasswordSalt) ?: "",
                name = "Test User 2",
                passwordSalt = testPasswordSalt,
                isAdmin = false
            )
        )

        setupTestData()
    }

    private fun setupTestData() {
        val today = LocalDate.now()

        // Current week entries (last 7 days including today)
        for (i in 0..6) {
            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = testUser1.id,
                    calories = 500.0,
                    subject = "Current Week Entry User1 Day $i",
                    registrationDate = today.minusDays(i.toLong()).atTime(12, 0)
                )
            )

            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = testUser2.id,
                    calories = 600.0,
                    subject = "Current Week Entry User2 Day $i",
                    registrationDate = today.minusDays(i.toLong()).atTime(12, 0)
                )
            )
        }

        // Previous week entries (8-14 days ago)
        for (i in 8..14) {
            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = testUser1.id,
                    calories = 450.0,
                    subject = "Previous Week Entry User1 Day $i",
                    registrationDate = today.minusDays(i.toLong()).atTime(12, 0)
                )
            )
        }
    }

    @AfterEach
    fun cleanup() {
        ledgerEntryRepository.deleteAll()
        userProfileRepository.deleteAll()
    }

    @Test
    fun `should get admin dashboard report as admin`() {
        webTestClient.get()
            .uri("/admin/report")
            .headers { it.setBasicAuth(adminUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBody<AdminDashboardReport>()
            .consumeWith { response ->
                val report = response.responseBody!!

                // Verify weekly comparison
                assert(report.weeklyComparison.currentWeekEntries == 14L) // 7 days * 2 users
                assert(report.weeklyComparison.previousWeekEntries == 7L) // 7 days * 1 user

                // Verify user averages
                assert(report.userAverages.size == 2)
                val user1Average = report.userAverages.find { it.userId == testUser1.id }
                val user2Average = report.userAverages.find { it.userId == testUser2.id }

                assert(user1Average != null && user1Average.averageCalories == 500.0)
                assert(user2Average != null && user2Average.averageCalories == 600.0)
            }
    }

    @Test
    fun `should get weekly comparison as admin`() {
        webTestClient.get()
            .uri("/admin/report/weekly-comparison")
            .headers { it.setBasicAuth(adminUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBody<WeeklyComparisonReport>()
            .consumeWith { response ->
                val comparison = response.responseBody!!

                assert(comparison.currentWeekEntries == 14L)
                assert(comparison.previousWeekEntries == 7L)
                assert(comparison.percentageChange == 100.0) // 100% increase
            }
    }

    @Test
    fun `should get user averages as admin`() {
        webTestClient.get()
            .uri("/admin/report/user-averages")
            .headers { it.setBasicAuth(adminUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBody<List<UserCaloriesAverage>>()
            .consumeWith { response ->
                val averages = response.responseBody!!

                assert(averages.size == 2)

                val user1Average = averages.find { it.userId == testUser1.id }
                val user2Average = averages.find { it.userId == testUser2.id }

                assert(user1Average != null && user1Average.averageCalories == 500.0)
                assert(user2Average != null && user2Average.averageCalories == 600.0)
            }
    }

    @Test
    fun `should deny access to regular user for admin report`() {
        webTestClient.get()
            .uri("/admin/report")
            .headers { it.setBasicAuth(regularUsername, testPassword) }
            .exchange()
            .expectStatus().isForbidden
    }

    @Test
    fun `should deny access to regular user for weekly comparison`() {
        webTestClient.get()
            .uri("/admin/report/weekly-comparison")
            .headers { it.setBasicAuth(regularUsername, testPassword) }
            .exchange()
            .expectStatus().isForbidden
    }

    @Test
    fun `should deny access to regular user for user averages`() {
        webTestClient.get()
            .uri("/admin/report/user-averages")
            .headers { it.setBasicAuth(regularUsername, testPassword) }
            .exchange()
            .expectStatus().isForbidden
    }

    @Test
    fun `should deny access without authentication`() {
        webTestClient.get()
            .uri("/admin/report")
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    fun `should handle zero previous week entries correctly`() {
        // Clean up previous week entries
        ledgerEntryRepository.deleteAll()

        val today = LocalDate.now()
        // Add only current week entries
        ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = testUser1.id,
                calories = 500.0,
                subject = "Current Entry",
                registrationDate = today.atTime(12, 0)
            )
        )

        webTestClient.get()
            .uri("/admin/report/weekly-comparison")
            .headers { it.setBasicAuth(adminUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBody<WeeklyComparisonReport>()
            .consumeWith { response ->
                val comparison = response.responseBody!!

                assert(comparison.currentWeekEntries == 1L)
                assert(comparison.previousWeekEntries == 0L)
                assert(comparison.percentageChange == 0.0) // No division by zero
            }
    }

    @Test
    fun `should handle no entries correctly`() {
        ledgerEntryRepository.deleteAll()

        webTestClient.get()
            .uri("/admin/report")
            .headers { it.setBasicAuth(adminUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBody<AdminDashboardReport>()
            .consumeWith { response ->
                val report = response.responseBody!!

                assert(report.weeklyComparison.currentWeekEntries == 0L)
                assert(report.weeklyComparison.previousWeekEntries == 0L)
                assert(report.weeklyComparison.percentageChange == 0.0)
                assert(report.userAverages.isEmpty())
            }
    }

    @Test
    fun `should calculate correct averages with multiple entries per day`() {
        ledgerEntryRepository.deleteAll()

        val today = LocalDate.now()

        // User1: 3 entries per day for 7 days with different calorie values
        for (i in 0..6) {
            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = testUser1.id,
                    calories = 300.0,
                    subject = "Entry 1",
                    registrationDate = today.minusDays(i.toLong()).atTime(8, 0)
                )
            )
            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = testUser1.id,
                    calories = 500.0,
                    subject = "Entry 2",
                    registrationDate = today.minusDays(i.toLong()).atTime(13, 0)
                )
            )
            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = testUser1.id,
                    calories = 400.0,
                    subject = "Entry 3",
                    registrationDate = today.minusDays(i.toLong()).atTime(19, 0)
                )
            )
        }

        webTestClient.get()
            .uri("/admin/report/user-averages")
            .headers { it.setBasicAuth(adminUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBody<List<UserCaloriesAverage>>()
            .consumeWith { response ->
                val averages = response.responseBody!!

                val user1Average = averages.find { it.userId == testUser1.id }
                assert(user1Average != null && user1Average.averageCalories == 400.0) // (300 + 500 + 400) / 3
            }
    }
}
