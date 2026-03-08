package com.salarysurvive.service;

import com.salarysurvive.dto.AuthResponse;
import com.salarysurvive.dto.LoginRequest;
import com.salarysurvive.dto.RegisterRequest;
import com.salarysurvive.model.User;
import com.salarysurvive.repository.UserRepository;
import com.salarysurvive.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public void register(RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("USER");  // By default all are set to role = user

        userRepository.save(user);
    }

    // ✅ Login now returns BOTH access token + refresh token
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Generate short-lived access token (15 min)
        String accessToken = jwtService.generateToken(user);

        // Generate long-lived refresh token (7 days)
        // refreshTokenService saves the HASH in DB, returns the RAW token for frontend
        String rawRefreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(accessToken, rawRefreshToken);
    }

    // ✅ Logout: delete refresh token from DB
    public void logout(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenService.deleteByUser(user);
    }
}
