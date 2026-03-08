package com.salarysurvive.security;

import com.salarysurvive.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // ✅ enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // ❌ no csrf for REST APIs
                .csrf(csrf -> csrf.disable())

                // ❌ no sessions (JWT = stateless)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // ✅ authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/salary/**").hasRole("USER")
                        .requestMatchers("/api/expenses/**").hasRole("USER")
                        .requestMatchers("/api/budget/**").hasRole("USER")
                        .requestMatchers("/api/dashboard/**").hasRole("USER")
                        .anyRequest().authenticated()
                )


                // ✅ return 401 (not 403) when a request is not authenticated
                //    Without this, Spring uses Http403ForbiddenEntryPoint by default when
                //    form login is disabled, causing the frontend refresh interceptor to miss it.
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, e) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Unauthorized — please log in again\"}");
                        })
                )

                // ❌ no form login, no basic auth
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                // ✅ register JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    // needed for login authentication
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    // ✅ CORS configuration for frontend communication
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow frontend origin
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",  // Vite default
                "http://localhost:3000"   // Alternative frontend port
        ));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Expose Authorization header to frontend
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

//http
//Starts HTTP security configuration
//
//.csrf(AbstractHttpConfigurer::disable)
//Disables CSRF protection
//
//Common for REST APIs
//
//Required for POST/PUT without CSRF token
//
//.userDetailsService(userDetailsService)
//Tells Spring Security:
//👉 “Use my custom user loader”
//
//Authentication will now fetch users from DB
//
//.authorizeHttpRequests(auth -> auth
//Starts authorization rules
//
//Defines who can access which URLs
//
//.requestMatchers("/api/auth/**").permitAll()
//Allows anyone (no login needed)
//Used for register & login endpoints
//
//.requestMatchers("/api/salary/**").authenticated()
//Requires login
//Only authenticated users can access salary APIs
//
//.anyRequest().permitAll()
//Any other URL is allowed without authentication

//.httpBasic(Customizer.withDefaults());
//Enables HTTP Basic Authentication
//
//Username + password sent in request headers
//
//Simple and useful for testing APIs
//
//return http.build();
//Builds and returns the security configuration
//
//Spring Security starts enforcing it
//
//🔁 Request flow summary
//Request → SecurityFilterChain → Authentication → Authorization → Controller