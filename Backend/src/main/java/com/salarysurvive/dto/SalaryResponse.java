package com.salarysurvive.dto;

import java.util.UUID;

public record SalaryResponse(
        UUID id,
        Double amount,
        Integer salaryDate,
        Integer month,
        Integer year,
        String monthName
) {}
