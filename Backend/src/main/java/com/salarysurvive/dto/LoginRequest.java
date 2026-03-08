package com.salarysurvive.dto;

public record LoginRequest(
        String email,
        String password
) {}

//DTO (Data Transfer Object) in simple words 👇
//
//👉 DTO is used to transfer data between layers safely.
//
//Carries only required data
//
//Hides sensitive fields (like password)
//
//Avoids exposing full entity
//
//📌 Flow:
//Controller ↔ DTO ↔ Service ↔ Entity ↔ DAO
