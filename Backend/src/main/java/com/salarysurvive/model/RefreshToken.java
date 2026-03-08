package com.salarysurvive.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
public class RefreshToken {

    @Id
    @GeneratedValue
    private UUID id;

    // The actual random token string stored in DB
    @Column(nullable = false, unique = true)
    private String token;

    // Which user this refresh token belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // When this refresh token expires
    @Column(nullable = false)
    private Instant expiryDate;
}

// 💡 Why store refresh token in DB?
// - So we can REVOKE it (logout)
// - So we can check if it's expired
// - So we can control how many sessions a user has
//
// Access token → short lived (15 min), stored only in frontend memory
// Refresh token → long lived (7 days), stored in DB so we can invalidate it
