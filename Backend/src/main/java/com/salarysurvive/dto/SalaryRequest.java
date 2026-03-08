package com.salarysurvive.dto;

public record SalaryRequest(
        Double amount,
        Integer salaryDate,
        Integer month,
        Integer year
) {}

//🧠 Important Difference
//Before (class):
//request.getAmount()

//After (record):
//request.amount()

//⚠ Notice:
//No get
//Just method with same name as field

//Records are:
//✅ Immutable
//✅ Cleaner
//✅ Less boilerplate
//✅ Industry standard now

//Records are perfect for:
//Request DTO
//Response DTO
//API payload