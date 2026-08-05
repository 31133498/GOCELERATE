package com.gocelerate.gocelerate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// Keeps PasswordEncoder in its own config class to avoid a circular dependency:
// SecurityConfig → JwtFilter → AuthService → PasswordEncoder → SecurityConfig
@Configuration
public class JwtConfig {

    // BCryptPasswordEncoder hashes passwords using the bcrypt algorithm
    // BCrypt automatically handles salting — each hash is unique even for identical passwords
    // The default strength factor is 10, which means 2^10 = 1024 rounds of hashing
    // This makes brute-force attacks computationally expensive
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
