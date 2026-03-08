package com.salarysurvive.dto;

public record ExpenseCreateResponse(
        String message,
        boolean budgetExceeded,
        Double exceededBy
) {}

