package com.salarysurvive.dto;

import java.util.Map;

public record MonthlySummaryResponse(
        Double totalSalary,
        Double totalExpense,
        Double remainingBalance,
        Double savingsRate,
        Double expenseRatio,
        Integer healthScore,
        Map<String, Double> categoryBreakdown
) {}
