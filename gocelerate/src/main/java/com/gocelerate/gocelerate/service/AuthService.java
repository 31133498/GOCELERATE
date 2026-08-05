package com.gocelerate.gocelerate.service;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.LoginRequest;
import com.gocelerate.gocelerate.dto.LoginResponse;
import com.gocelerate.gocelerate.dto.RegisterRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import com.gocelerate.gocelerate.model.User;
import com.gocelerate.gocelerate.repository.UserRepository;
import com.gocelerate.gocelerate.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// Implementing UserDetailsService lets Spring Security use this class to load users by email
// during JWT validation in JwtFilter.
@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Spring Security calls this when it needs to verify the owner of a JWT.
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // Spring's built-in User class implements UserDetails.
        // roles("IMPLEMENTER") automatically adds the "ROLE_IMPLEMENTER" granted authority.
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    public ApiResponse<String> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // BCrypt hashes the plain-text password; the original is never stored.
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);
        return ApiResponse.success("Registration successful", null);
    }

    public ApiResponse<LoginResponse> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        LoginResponse.UserDto userDto = new LoginResponse.UserDto(
                user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
        return ApiResponse.success("Login successful", new LoginResponse(token, userDto));
    }

    public ApiResponse<String> changePassword(String currentPassword, String newPassword) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ApiResponse.success("Password updated successfully", null);
    }
}
