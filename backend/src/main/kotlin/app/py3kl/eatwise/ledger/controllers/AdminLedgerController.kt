package app.py3kl.eatwise.ledger.controllers

import app.py3kl.eatwise.ledger.models.LedgerEntry
import app.py3kl.eatwise.ledger.models.LedgerEntryRequest
import app.py3kl.eatwise.ledger.services.LedgerEntryService
import app.py3kl.eatwise.profile.models.UserProfile
import app.py3kl.eatwise.profile.utils.CurrentUser
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.UUID

@RestController()
@PreAuthorize("hasRole('ADMIN')")
class AdminLedgerController(
    val ledgerEntryService: LedgerEntryService
) {

    @GetMapping("/admin/ledger/entries")
    fun getEntries(
        @CurrentUser profile: UserProfile
    ): Flux<LedgerEntry> = ledgerEntryService.getAllEntriesAsync(profile, isAdminRequest = true)

    @PostMapping("/admin/ledger/entries")
    fun createEntry(
        @CurrentUser profile: UserProfile,
        @RequestBody entry: LedgerEntryRequest
    ): Mono<LedgerEntry> = ledgerEntryService.createEntryAsync(profile, entry, isAdminRequest = true)

    @PutMapping("/admin/ledger/entries/{id}")
    fun updateEntry(
        @CurrentUser profile: UserProfile,
        @PathVariable("id") id: UUID,
        @RequestBody entry: LedgerEntryRequest
    ): Mono<LedgerEntry> = ledgerEntryService.updateEntryAsync(profile, id, entry, isAdminRequest = true)

    @DeleteMapping("/admin/ledger/entries/{id}")
    fun deleteEntry(
        @CurrentUser profile: UserProfile,
        @PathVariable("id") id: UUID
    ): Mono<Boolean> = ledgerEntryService.deleteEntryAsync(profile, id, isAdminRequest = true)
}