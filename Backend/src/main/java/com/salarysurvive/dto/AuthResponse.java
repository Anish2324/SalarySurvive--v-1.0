package com.salarysurvive.dto;

// Sent back to frontend after login or token refresh
public record AuthResponse(
        String accessToken,
        String refreshToken
) {}

// 💡 Why two tokens?
// accessToken  → short-lived (15 min), used for every API call
// refreshToken → long-lived (7 days), used ONLY to get a new accessToken
