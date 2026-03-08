package com.salarysurvive.service;

import com.salarysurvive.model.RefreshToken;
import com.salarysurvive.model.User;
import com.salarysurvive.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration; // in milliseconds

    // ✅ Create refresh token
    // Returns the RAW token (sent to frontend)
    // Saves only the SHA-256 HASH in DB
    // → If DB is hacked, attacker gets hashes, not usable tokens
    @Transactional
    public String createRefreshToken(User user) {

        // Delete any existing tokens for this user (one session at a time)
        refreshTokenRepository.deleteByUser(user);

        // Generate random raw token
        String rawToken = UUID.randomUUID().toString();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(hashToken(rawToken)); // store HASH, not raw
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshExpiration));

        refreshTokenRepository.save(refreshToken);

        return rawToken; // return RAW token to send to frontend
    }

    // ✅ Find by token: hash the incoming value first, then look up
    public RefreshToken findByToken(String rawToken) {
        String hashed = hashToken(rawToken);
        return refreshTokenRepository.findByToken(hashed)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
    }

    // ✅ Check if the refresh token is expired
    @Transactional
    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token); // clean up expired token
            throw new RuntimeException("Refresh token has expired. Please login again.");
        }
        return token;
    }

    // ✅ Delete refresh token on logout
    @Transactional
    public void deleteByUser(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    // ✅ SHA-256 hash helper
    // SHA-256 is one-way: you can't reverse a hash back to the raw token
    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes); // convert bytes → hex string
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}

// 💡 Flow Summary:
// LOGIN  → generate raw token → hash it → save HASH in DB → send RAW to frontend
// REFRESH → frontend sends raw token → hash it → find hash in DB → issue new access token
// HACK DB  → attacker sees only hashes → useless without the raw tokens
// REFRESH → find token in DB → check not expired → issue new access token
// LOGOUT → delete token from DB → user must login again
