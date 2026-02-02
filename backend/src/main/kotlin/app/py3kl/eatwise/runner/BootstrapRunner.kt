package app.py3kl.eatwise.runner

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.repositories.LedgerEntryRepository
import app.py3kl.eatwise.logger
import app.py3kl.eatwise.profile.models.UserProfileRequest
import app.py3kl.eatwise.profile.services.UserProfileService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.*

@Component
class BootstrapRunner(
    @Autowired @Qualifier("FixtureUsers")
    private val fixtureUsers: List<Map<String, String>>,
    @Autowired @Qualifier("FixtureLedger")
    private val fixtureLedger: List<Map<String, String>>,
    @Autowired
    private val userProfileService: UserProfileService,
    @Autowired
    private val ledgerEntryRepository: LedgerEntryRepository
) : CommandLineRunner {

    val log = logger()

    override fun run(vararg args: String) {
        log.info("BootstrapRunner started with ${fixtureUsers.size} fixture users")
        initUsers()
        log.info("Cleaning up existing ledger entries")
        cleanupLedgerEntries()
        log.info("BootstrapRunner started with ${fixtureLedger.size} fixture ledger entries")
        initSampleDate()
        log.info("BootstrapRunner completed")
    }

    @Transactional
    private fun initUsers() {
        fixtureUsers.forEach { userRow ->
            val email = userRow["email"] ?: return@forEach
            val exists = userProfileService.existsByEmail(email)
            if (exists) {
                log.info("User with email $email already exists, skipping creation")
                return@forEach
            }
            val name = userRow["name"] ?: ""
            val isAdmin = (userRow["isAdmin"] ?: "").toBoolean()
            val password = userRow["password"] ?: "password"
            val accessToken = userRow["accessToken"] ?: ""
            val kcal = userRow["kcal"]?.toLong() ?: 2100

            val userProfileRequest = UserProfileRequest(
                email = email,
                name = name,
                password = password,
                kcalThreshold = kcal,
            )

            if (isAdmin) {
                userProfileService.createAdminUserProfile(userProfileRequest).let {
                    userProfileService.setAccessTokenForUser(email, accessToken)
                }
                log.info("Created admin user with email $email")
            } else {
                userProfileService.createUserProfile(userProfileRequest).let {
                    userProfileService.setAccessTokenForUser(email, accessToken)
                }
                log.info("Created user with email $email")
            }
        }
    }

    @Transactional
    private fun cleanupLedgerEntries() {
        fixtureUsers.forEach { userRow ->
            val email = userRow["email"] ?: return@forEach
            val userProfile = userProfileService.getUserProfileByEmail(email) ?: return@forEach
            val userLedgerEntries = ledgerEntryRepository.findByUserId(userProfile.id)
            ledgerEntryRepository.deleteAll(userLedgerEntries)
        }
    }

    @Transactional
    private fun initSampleDate() {
        val today = LocalDate.now()

        fixtureLedger.forEach { ledgerEntry ->
            val email = ledgerEntry["email"] ?: return@forEach
            val userProfile = userProfileService.getUserProfileByEmail(email) ?: run {
                log.warn("User with email $email not found, skipping ledger entry creation")
                return@forEach
            }
            val calories = ledgerEntry["calories"]?.toDoubleOrNull() ?: return@forEach
            val subject = ledgerEntry["meal"] ?: ""
            val registrationDate = today.plusDays(ledgerEntry["registrationDelta"]?.toLong() ?: 0)

            ledgerEntryRepository.save(
                LedgerEntry(
                    id = UUID.randomUUID(),
                    userId = userProfile.id,
                    calories = calories,
                    subject = subject,
                    registrationDate = registrationDate.atTime(0, 0, 0)
                )
            )
        }
    }
}
