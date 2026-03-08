package com.salarysurvive.repository;

import com.salarysurvive.model.RefreshToken;
import com.salarysurvive.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    // Find a refresh token by its string value
    Optional<RefreshToken> findByToken(String token);

    // Delete all refresh tokens for a user (used during logout)
    void deleteByUser(User user);
}
