package com.salarysurvive.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityBeansConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

//Now Spring can inject PasswordEncoder anywhere.
//This means:
//
//        👉 Spring will:
//
//Create one object of BCryptPasswordEncoder
//
//Store it in Spring Container
//
//Register it with name passwordEncoder
//
//Now Spring knows:
//
//Whenever someone asks for PasswordEncoder, give this object.

//Bean = Spring-managed object you can reuse anywhere
//
//✅BCryptPasswordEncoder is used because:
//✔ One-way (cannot decode back)
//✔ Adds salt automatically
//✔ Slow by design → blocks brute-force attacks
//✔ Industry standard