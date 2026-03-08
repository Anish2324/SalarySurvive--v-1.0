package com.salarysurvive.controller;

import com.salarysurvive.dto.AuthResponse;
import com.salarysurvive.dto.LoginRequest;
import com.salarysurvive.dto.RegisterRequest;
import com.salarysurvive.model.RefreshToken;
import com.salarysurvive.service.AuthService;
import com.salarysurvive.service.RefreshTokenService;
import com.salarysurvive.security.jwt.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    // Cookie name constant — used in all 3 endpoints
    private static final String REFRESH_COOKIE = "refreshToken";

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("User registered successfully");
    }

    // ✅ Login → accessToken in JSON body + refreshToken in HTTP-only cookie
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.login(request);

        // Set refresh token as HTTP-only cookie
        // httpOnly(true)  → JavaScript cannot read this cookie (XSS safe)
        // secure(false)   → set to true in production (HTTPS only)
        // sameSite(Lax)   → protects against CSRF
        // path("/api/auth") → browser only sends cookie to /api/auth/** endpoints
        // maxAge(7 days)  → matches jwt.refresh-expiration
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, authResponse.refreshToken())
                .httpOnly(true)
                .secure(false)               // ⚠️ change to true in production
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(7 * 24 * 60 * 60)   // 7 days in seconds
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Only accessToken goes in the JSON body — refreshToken is in the cookie
        return ResponseEntity.ok(Map.of("accessToken", authResponse.accessToken()));
    }

    // ✅ Refresh → reads refreshToken from cookie automatically (browser sends it)
    //              returns new accessToken in JSON body
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(
            @CookieValue(name = REFRESH_COOKIE, required = false) String rawRefreshToken
    ) {
        if (rawRefreshToken == null) {
            return ResponseEntity.status(401).build();
        }

        RefreshToken refreshToken = refreshTokenService.findByToken(rawRefreshToken);
        refreshTokenService.verifyExpiration(refreshToken);
        String newAccessToken = jwtService.generateToken(refreshToken.getUser());

        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    // ✅ Logout → reads cookie, deletes token from DB, then clears the cookie
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @CookieValue(name = REFRESH_COOKIE, required = false) String rawRefreshToken,
            HttpServletResponse response
    ) {
        if (rawRefreshToken != null) {
            try {
                RefreshToken refreshToken = refreshTokenService.findByToken(rawRefreshToken);
                refreshTokenService.deleteByUser(refreshToken.getUser());
            } catch (Exception ignored) {
                // token already gone from DB — still clear cookie
            }
        }

        // Clear the cookie by setting maxAge to 0
        ResponseCookie clearCookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(false)               // ⚠️ change to true in production
                .sameSite("Lax")
                .path("/api/auth")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());

        return ResponseEntity.ok("Logged out successfully");
    }
}

// refreshToken → HTTP-only cookie  → JS cannot steal it (XSS safe)
// accessToken  → memory only       → gone on page refresh (XSS safe, auto-restored via cookie)
// DB           → stores hash only  → useless if hacked