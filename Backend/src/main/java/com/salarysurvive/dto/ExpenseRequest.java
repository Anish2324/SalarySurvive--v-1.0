package com.salarysurvive.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record ExpenseRequest(

        @NotBlank(message = "Title is required")
        String title,

        @NotNull(message = "Amount is required")
        @Positive(message = "Amount must be positive")
        Double amount,

        @NotBlank(message = "Category is required")
        String category,

        @NotNull(message = "Expense date is required")
        LocalDate expenseDate
) {}




//🧠 Why DTO?
//
//We NEVER accept entity directly.
//Because:
//Security
//Clean architecture
//Avoid exposing DB structure