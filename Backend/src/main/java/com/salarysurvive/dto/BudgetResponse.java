package com.salarysurvive.dto;

public record BudgetResponse(
        String category,
        Double limitAmount,
        Double spentAmount,
        boolean exceeded,
        Double exceededBy
) {}
