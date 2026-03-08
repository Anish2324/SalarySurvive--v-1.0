package com.salarysurvive.dto;

public record MonthlyTrendResponse(
        Integer month,
        Integer year,
        Double salary,
        Double expense,
        double balance) {}

