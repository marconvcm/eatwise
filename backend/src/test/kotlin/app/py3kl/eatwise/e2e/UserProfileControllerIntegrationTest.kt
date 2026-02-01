package app.py3kl.eatwise.e2e

import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.models.UserProfileInvite
import app.py3kl.eatwise.profile.models.UserProfileInviteRequest
import app.py3kl.eatwise.profile.repositories.UserProfileInviteRepository
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
class UserProfileControllerIntegrationTest {

    @Autowired
    private lateinit var webTestClient: WebTestClient

    @Autowired
    private lateinit var userProfileRepository: UserProfileRepository

    @Autowired
    private lateinit var userProfileInviteRepository: UserProfileInviteRepository

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
        userProfileInviteRepository.deleteAll()
        userProfileRepository.deleteAll()
    }

    @Test
    fun `should get authenticated user profile`() {
        webTestClient.get()
            .uri("/profile/me")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .exchange()
            .expectStatus().isOk
            .expectBody<UserProfile>()
            .consumeWith { response ->
                val profile = response.responseBody!!
                assert(profile.id == testUser.id)
                assert(profile.email == testUsername)
                assert(profile.name == "Test User")
                assert(profile.isAdmin == false)
            }
    }

    @Test
    fun `should fail to get profile without authentication`() {
        webTestClient.get()
            .uri("/profile/me")
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    fun `should send invite successfully`() {
        val inviteRequest = UserProfileInviteRequest(
            name = "Jane Doe",
            targetUserEmail = "jane@example.com",
            message = "Join me on EatWise!"
        )

        webTestClient.post()
            .uri("/profile/invite")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(inviteRequest), UserProfileInviteRequest::class.java)
            .exchange()
            .expectStatus().isOk
            .expectBody<UserProfileInvite>()
            .consumeWith { response ->
                val invite = response.responseBody!!
                assert(invite.targetUserEmail == "jane@example.com")
                assert(invite.targetName == "Jane Doe")
                assert(invite.sourceUserId == testUser.id)
            }

        val savedInvites = userProfileInviteRepository.findBySourceUserId(testUser.id)
        assert(savedInvites.size == 1)
    }

    @Test
    fun `should fail to send invite without authentication`() {
        val inviteRequest = UserProfileInviteRequest(
            name = "Jane Doe",
            targetUserEmail = "jane@example.com",
            message = "Join me!"
        )

        webTestClient.post()
            .uri("/profile/invite")
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(inviteRequest), UserProfileInviteRequest::class.java)
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    fun `should fail to send duplicate invite within cooldown period`() {
        val targetEmail = "duplicate@example.com"

        userProfileInviteRepository.save(
            UserProfileInvite(
                id = UUID.randomUUID(),
                targetName = "First Invite",
                sourceUserId = testUser.id,
                targetUserEmail = targetEmail,
                createdAt = LocalDateTime.now().minusMinutes(30)
            )
        )

        val inviteRequest = UserProfileInviteRequest(
            name = "Second Invite",
            targetUserEmail = targetEmail,
            message = null
        )

        webTestClient.post()
            .uri("/profile/invite")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(inviteRequest), UserProfileInviteRequest::class.java)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should allow invite after cooldown period`() {
        val targetEmail = "cooldown@example.com"

        userProfileInviteRepository.save(
            UserProfileInvite(
                id = UUID.randomUUID(),
                targetName = "Old Invite",
                sourceUserId = testUser.id,
                targetUserEmail = targetEmail,
                createdAt = LocalDateTime.now().minusHours(2)
            )
        )

        val inviteRequest = UserProfileInviteRequest(
            name = "New Invite",
            targetUserEmail = targetEmail,
            message = null
        )

        webTestClient.post()
            .uri("/profile/invite")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(inviteRequest), UserProfileInviteRequest::class.java)
            .exchange()
            .expectStatus().isOk
            .expectBody<UserProfileInvite>()
            .consumeWith { response ->
                val invite = response.responseBody!!
                assert(invite.targetUserEmail == targetEmail)
                assert(invite.targetName == "New Invite")
            }
    }

    @Test
    fun `should fail when exceeding rate limit`() {
        repeat(5) { i ->
            userProfileInviteRepository.save(
                UserProfileInvite(
                    id = UUID.randomUUID(),
                    targetName = "User $i",
                    sourceUserId = testUser.id,
                    targetUserEmail = "user$i@example.com",
                    createdAt = LocalDateTime.now().minusMinutes(10)
                )
            )
        }

        val inviteRequest = UserProfileInviteRequest(
            name = "Sixth User",
            targetUserEmail = "sixth@example.com",
            message = null
        )

        webTestClient.post()
            .uri("/profile/invite")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(inviteRequest), UserProfileInviteRequest::class.java)
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should send invite with custom message`() {
        val inviteRequest = UserProfileInviteRequest(
            name = "Bob Smith",
            targetUserEmail = "bob@example.com",
            message = "Let's track our health together!"
        )

        webTestClient.post()
            .uri("/profile/invite")
            .headers { it.setBasicAuth(testUsername, testPassword) }
            .contentType(MediaType.APPLICATION_JSON)
            .body(Mono.just(inviteRequest), UserProfileInviteRequest::class.java)
            .exchange()
            .expectStatus().isOk
            .expectBody<UserProfileInvite>()
            .consumeWith { response ->
                val invite = response.responseBody!!
                assert(invite.targetUserEmail == "bob@example.com")
            }
    }

    @Test
    fun `should send multiple invites to different users`() {
        val emails = listOf("user1@example.com", "user2@example.com", "user3@example.com")

        emails.forEach { email ->
            val inviteRequest = UserProfileInviteRequest(
                name = "User $email",
                targetUserEmail = email,
                message = null
            )

            webTestClient.post()
                .uri("/profile/invite")
                .headers { it.setBasicAuth(testUsername, testPassword) }
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(inviteRequest), UserProfileInviteRequest::class.java)
                .exchange()
                .expectStatus().isOk
        }

        val savedInvites = userProfileInviteRepository.findBySourceUserId(testUser.id)
        assert(savedInvites.size == 3)
    }

    @Test
    fun `should authenticate with access token`() {
        val accessToken = UUID.randomUUID().toString()

        val userWithToken = userProfileRepository.save(
            testUser.copy(accessToken = accessToken)
        )

        webTestClient.get()
            .uri("/profile/me")
            .header("Authorization", "Bearer $accessToken")
            .exchange()
            .expectStatus().isOk
            .expectBody<UserProfile>()
            .consumeWith { response ->
                val profile = response.responseBody!!
                assert(profile.id == userWithToken.id)
                assert(profile.email == testUsername)
            }
    }

    @Test
    fun `should fail with invalid access token`() {
        webTestClient.get()
            .uri("/profile/me")
            .header("Authorization", "Bearer invalid-token")
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    fun `should fail with expired or revoked access token`() {
        val revokedToken = "revoked-token"

        webTestClient.get()
            .uri("/profile/me")
            .header("Authorization", "Bearer $revokedToken")
            .exchange()
            .expectStatus().isUnauthorized
    }
}
