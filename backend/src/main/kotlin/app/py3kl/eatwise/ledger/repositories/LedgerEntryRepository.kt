package app.py3kl.eatwise.ledger.repositories

import app.py3kl.eatwise.ledger.models.LedgerEntry
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
interface LedgerEntryRepository : CrudRepository<LedgerEntry, UUID> {

    fun findByUserId(userId: UUID): List<LedgerEntry>

    fun findByIdAndUserId(id: UUID, userId: UUID): LedgerEntry?

    fun findByRegistrationDateBetween(
        startDate: LocalDateTime,
        endDate: LocalDateTime
    ): List<LedgerEntry>
}


