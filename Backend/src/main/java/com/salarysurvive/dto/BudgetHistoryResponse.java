package com.salarysurvive.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record BudgetHistoryResponse(
        UUID id,
        String category,
        Double limitAmount,
        Integer month,
        Integer year,
        LocalDateTime createdAt
) {}
