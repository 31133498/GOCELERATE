package com.gocelerate.gocelerate.controller;

import com.gocelerate.gocelerate.dto.ApiResponse;
import com.gocelerate.gocelerate.dto.LoginRequest;
import com.gocelerate.gocelerate.dto.LoginResponse;
import com.gocelerate.gocelerate.dto.RegisterRequest;
import com.gocelerate.gocelerate.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Register and login endpoints")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new user", description = "Creates a new IMPLEMENTER or FUNDER account")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<LoginResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @Operation(summary = "Login", description = "Authenticates a user and returns a JWT bearer token valid for 24 hours")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Change password", description = "Updates the authenticated user's password")
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(authService.changePassword(body.get("currentPassword"), body.get("newPassword")));
    }
}
