package app.py3kl.eatwise.e2e

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.models.LedgerEntryRequest
import app.py3kl.eatwise.ledger.repositories.LedgerEntryRepository
import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.repositories.UserProfileRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient
import org.springframework.http.MediaType
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody
import reactor.core.publisher.Mono
import java.time.LocalDateTime
import java.util.*

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class LedgerControllerIntegrationTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @Autowired
    private lateinit var userProfileRepository: UserProfileRepository

    @Autowired
    private lateinit var ledgerEntryRepository: LedgerEntryRepository

    @Autowired
    private lateinit var passwordEncoder: PasswordEncoder

    private lateinit var testUser: UserProfile
    private val testUsername = "test@example.com"
    private val testPassword = "password123"
    private val testPasswordSalt = "somesalt"

    @BeforeEach
    fun setup() {
        testUser = userProfileRepository.save(
            UserProfile(
                id = UUID.randomUUID(),
                email = testUsername,
                password = passwordEncoder.encode(testPassword + testPasswordSalt) ?: "",
                name = "Test User",
                passwordSalt = testPasswordSalt,
                isAdmin = false
            )
        )
    }

    @AfterEach
    fun cleanup() {
        ledgerEntryRepository.deleteAll()
        userProfileRepository.deleteAll()
    }


    @Test
    fun `should create entry with authentication`() {
        val request = LedgerEntryRequest(
            calories = 250.5,
            subject = "Breakfast - Oatmeal",
            registrationDate = LocalDateTime.now()
        )

        webTestClient.post()
            .uri("/ledger/entries")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(request), LedgerEntryRequest::class.java)
            .exchange()
            .expectStatus().isOk
            .expectBody<LedgerEntry>()
            .consumeWith { response ->
                val entry = response.responseBody!!
                assert(entry.calories == 250.5)
                assert(entry.subject == "Breakfast - Oatmeal")
                assert(entry.userId == testUser.id)
            }
    }

    @Test
    fun `should fail to create entry without authentication`() {
        val request = LedgerEntryRequest(
            calories = 350.0,
            subject = "Lunch - Salad",
            registrationDate = LocalDateTime.now()
        )

        webTestClient.post()
            .uri("/ledger/entries")
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(request), LedgerEntryRequest::class.java)
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    fun `should get all entries for authenticated user`() {
        val entry = ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = testUser.id!!,
                calories = 450.0,
                subject = "Dinner - Chicken",
                registrationDate = LocalDateTime.now()
            )
        )

        webTestClient.get()
            .uri("/ledger/entries")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBodyList(LedgerEntry::class.java)
            .hasSize(1)
    }

    @Test
    fun `should update entry for authenticated user`() {
        val entry = ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = testUser.id,
                calories = 200.0,
                subject = "Snack - Original",
                registrationDate = LocalDateTime.now()
            )
        )

        val updateRequest = LedgerEntryRequest(
            calories = 300.0,
            subject = "Snack - Updated",
            registrationDate = LocalDateTime.now()
        )

        webTestClient.put()
            .uri("/ledger/entries/${entry.id}")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(updateRequest), LedgerEntryRequest::class.java)
            .exchange()
            .expectStatus().isOk
            .expectBody<LedgerEntry>()
            .consumeWith { response ->
                val updated = response.responseBody!!
                assert(updated.calories == 300.0)
                assert(updated.subject == "Snack - Updated")
            }
    }

    @Test
    fun `should delete entry for authenticated user`() {
        val entry = ledgerEntryRepository.save(
            LedgerEntry(
                id = UUID.randomUUID(),
                userId = testUser.id,
                calories = 150.0,
                subject = "To delete",
                registrationDate = LocalDateTime.now()
            )
        )

        webTestClient.delete()
            .uri("/ledger/entries/${entry.id}")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBody<Boolean>()
            .isEqualTo(true)

        val deleted = ledgerEntryRepository.findById(entry.id!!).orElse(null)
        assert(deleted == null)
    }

    @Test
    fun `should fail to access with invalid credentials`() {
        webTestClient.get()
            .uri("/ledger/entries")
            .headers { it.setBasicAuth(testUsername, "wrongpassword") }
            .exchange()
            .expectStatus().isUnauthorized
    }
}
