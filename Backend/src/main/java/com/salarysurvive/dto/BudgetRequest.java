package com.salarysurvive.dto;

public record BudgetRequest(
        String category,
        Double limitAmount,
        Integer month,
        Integer year
) {}
