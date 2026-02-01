package app.py3kl.eatwise.ledger.services

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.models.LedgerEntryRequest
import app.py3kl.eatwise.profile.models.UserProfile
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.UUID

interface LedgerEntryService {
    fun createEntry(userProfile: UserProfile, entry: LedgerEntryRequest, isAdminRequest: Boolean = false): LedgerEntry
    fun getAllEntries(userProfile: UserProfile, isAdminRequest: Boolean = false): Iterable<LedgerEntry>
    fun updateEntry(userProfile: UserProfile, id: UUID, entry: LedgerEntryRequest, isAdminRequest: Boolean = false): LedgerEntry?
    fun deleteEntry(userProfile: UserProfile, id: UUID, isAdminRequest: Boolean = false): Boolean


    fun createEntryAsync(userProfile: UserProfile, entry: LedgerEntryRequest, isAdminRequest: Boolean = false): Mono<LedgerEntry> =
        Mono.just(createEntry(userProfile, entry, isAdminRequest))

    fun getAllEntriesAsync(userProfile: UserProfile, isAdminRequest: Boolean = false): Flux<LedgerEntry> =
        Flux.fromIterable(getAllEntries(userProfile, isAdminRequest))

    fun updateEntryAsync(userProfile: UserProfile, id: UUID, entry: LedgerEntryRequest, isAdminRequest: Boolean = false): Mono<LedgerEntry> =
        Mono.justOrEmpty(updateEntry(userProfile, id, entry, isAdminRequest))

    fun deleteEntryAsync(userProfile: UserProfile, id: UUID, isAdminRequest: Boolean = false): Mono<Boolean> =
        Mono.just(deleteEntry(userProfile, id, isAdminRequest))
}
