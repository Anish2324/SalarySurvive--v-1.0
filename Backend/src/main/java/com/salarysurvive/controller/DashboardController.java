package com.salarysurvive.controller;

import com.salarysurvive.dto.*;
import com.salarysurvive.model.User;
import com.salarysurvive.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // Monthly Summary
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/summary")
    public MonthlySummaryResponse getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam Integer month,
            @RequestParam Integer year
    ) {
        return dashboardService.getMonthlySummary(user, month, year);
    }

    // Last 6 months trend
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/trend")
    public List<MonthlyTrendResponse> getTrend(
            @AuthenticationPrincipal User user
    ) {
        return dashboardService.getLastSixMonthsTrend(user);
    }

    // Top categories
    @PreAuthorize("hasRole('USER')")
    @GetMapping("/top-categories")
    public List<TopCategoryResponse> getTopCategories(
            @AuthenticationPrincipal User user
    ) {
        return dashboardService.getTopSpendingCategories(user);
    }
}
