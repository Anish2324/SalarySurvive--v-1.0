package com.salarysurvive.security.jwt;

//Check every request, find who the user is, and tell Spring Security that the user is logged in.
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1️⃣ Read Authorization header
        final String authHeader = request.getHeader("Authorization");

        // 2️⃣ If header missing or not Bearer → skip
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3️⃣ Extract JWT token
        final String jwt = authHeader.substring(7);  //Removes "Bearer ➡ Leaves only token

        // 4️⃣ Extract username (email) from token — wrapped in try/catch so expired
        //    or malformed tokens don't propagate as uncaught RuntimeExceptions.
        //    If extraction fails, the request continues unauthenticated and the
        //    AuthenticationEntryPoint returns 401, which triggers a token refresh.
        final String userEmail;
        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }

        // 5️⃣ Authenticate only if not already authenticated
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            // 6️⃣ Validate token
            if (jwtService.isTokenValid(jwt, userDetails)) {

                UsernamePasswordAuthenticationToken authToken =  //Tells Spring:“This user is authenticated”
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 7️⃣ Set authentication in context
                SecurityContextHolder.getContext().setAuthentication(authToken); //➡ Spring Security’s memory of current user
            }
        }

        // 8️⃣ Continue filter chain
        filterChain.doFilter(request, response);
    }
}
