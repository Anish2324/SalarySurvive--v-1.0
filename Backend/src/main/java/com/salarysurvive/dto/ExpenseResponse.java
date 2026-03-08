package com.salarysurvive.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        String title,
        Double amount,
        String category,
        LocalDate expenseDate,
        LocalDateTime createdAt
) {}
