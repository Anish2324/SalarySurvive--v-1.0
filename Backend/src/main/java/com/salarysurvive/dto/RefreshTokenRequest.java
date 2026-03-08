package com.salarysurvive.dto;

// Frontend sends this when access token expires
public record RefreshTokenRequest(
        String refreshToken
) {}
