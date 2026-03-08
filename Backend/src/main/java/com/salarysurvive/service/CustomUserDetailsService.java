package com.salarysurvive.service;

import com.salarysurvive.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));
    }
}

//Why did you implement CustomUserDetailsService?
// Here's the simple flow:

// User sends email + password to login
// Spring Security asks: "Hey, find me the user with this email"
// This class answers that question by looking up the user in your database via UserRepository
// If found, it returns the user; if not, it throws UsernameNotFoundException
// Why "Custom"? Spring Security has its own default UserDetailsService, but it looks users up by username. Since your app uses email to login, you wrote a custom version that uses email instead.

// In short: it's the bridge between Spring Security and your database



//Short answer:
//👉 Because Spring Security needs a way to load user details from the database, not from memory.
//When a user logs in with JWT:
//JWT filter extracts email from token
//
//It calls:userDetailsService.loadUserByUsername(email);

//Your CustomUserDetailsService:
//Fetches user from DB using UserRepository
//Returns UserDetails

//Spring Security then:
//Checks role
//Builds Authentication object
//Authorizes request
//
//Without CustomUserDetailsService, Spring would:
//Use default in-memory user
//Or fail authentication
//So it is required for: DB-based authentication
//JWT validation
//Role-based authorization

