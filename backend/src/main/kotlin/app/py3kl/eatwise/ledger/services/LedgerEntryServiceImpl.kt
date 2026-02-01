package app.py3kl.eatwise.ledger.services

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.models.LedgerEntryRequest
import app.py3kl.eatwise.ledger.repositories.LedgerEntryRepository
import app.py3kl.eatwise.profile.models.UserProfile
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class LedgerEntryServiceImpl(
    val ledgerEntryRepository: LedgerEntryRepository
) : LedgerEntryService {

    override fun createEntry(
        userProfile: UserProfile,
        entry: LedgerEntryRequest,
        isAdminRequest: Boolean
    ): LedgerEntry {
        val ledgerEntry = LedgerEntry(
            id = UUID.randomUUID(),
            userId = if (isAdminRequest && userProfile.isAdmin && entry.userId != null) {
                entry.userId
            } else {
                userProfile.id
            },
            calories = entry.calories,
            subject = entry.subject,
            registrationDate = entry.registrationDate
        )
        return ledgerEntryRepository.save(ledgerEntry)
    }

    override fun getAllEntries(userProfile: UserProfile, isAdminRequest: Boolean): Iterable<LedgerEntry> {
        return if (isAdminRequest && userProfile.isAdmin) {
            // admin can see all entries
            ledgerEntryRepository.findAll()
        } else {
            ledgerEntryRepository.findByUserId(userProfile.id)
        }
    }

    override fun updateEntry(
        userProfile: UserProfile,
        id: UUID,
        entry: LedgerEntryRequest,
        isAdminRequest: Boolean
    ): LedgerEntry? {
        val existing = if (isAdminRequest && userProfile.isAdmin) {
            ledgerEntryRepository.findById(id).orElse(null)
        } else {
            ledgerEntryRepository.findByIdAndUserId(id, userProfile.id)
        }

        return existing?.let { existingEntry ->
            val updatedEntry = existingEntry.copy(
                calories = entry.calories,
                subject = entry.subject,
                registrationDate = entry.registrationDate
            )
            ledgerEntryRepository.save(updatedEntry)
        }
    }

    override fun deleteEntry(userProfile: UserProfile, id: UUID, isAdminRequest: Boolean): Boolean {
        val existing = if (isAdminRequest && userProfile.isAdmin) {
            ledgerEntryRepository.findById(id).orElse(null)
        } else {
            ledgerEntryRepository.findByIdAndUserId(id, userProfile.id)
        }
        return existing?.let {
            ledgerEntryRepository.deleteById(it.id)
            true
        } ?: false
    }
}