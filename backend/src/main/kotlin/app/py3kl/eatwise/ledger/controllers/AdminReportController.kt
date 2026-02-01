package app.py3kl.eatwise.ledger.controllers

import app.py3kl.eatwise.ledger.reports.AdminDashboardReport
import app.py3kl.eatwise.ledger.reports.AdminReportAdapter
import app.py3kl.eatwise.ledger.reports.UserCaloriesAverage
import app.py3kl.eatwise.ledger.reports.WeeklyComparisonReport
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@PreAuthorize("hasRole('ADMIN')")
class AdminReportController(
    @Autowired
    val reportAdapter: AdminReportAdapter,
) {

    @GetMapping("/admin/report")
    fun getAdminReport(): Mono<AdminDashboardReport> = Mono.just(reportAdapter.getAdminReport())

    @GetMapping("/admin/report/weekly-comparison")
    fun getWeeklyComparison(): Mono<WeeklyComparisonReport> = Mono.just(reportAdapter.getWeeklyComparison())

    @GetMapping("/admin/report/user-averages")
    fun getUserAverages(): Flux<UserCaloriesAverage> = Flux.fromIterable(reportAdapter.getUserAverages())
}