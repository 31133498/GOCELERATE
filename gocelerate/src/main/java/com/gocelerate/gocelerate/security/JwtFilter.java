package com.gocelerate.gocelerate.security;

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

// OncePerRequestFilter guarantees this filter runs exactly once per HTTP request
// (some filter implementations run multiple times in redirect chains — this prevents that)
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1: Read the Authorization header
        String authHeader = request.getHeader("Authorization");

        // Step 2: If there's no Bearer token, pass the request through unchanged
        // The downstream SecurityConfig will then reject it if the endpoint is protected
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 3: Strip the "Bearer " prefix to get the raw token string
        String token = authHeader.substring(7);

        // Step 4: Validate the token — checks signature + expiry
        if (jwtUtil.isTokenValid(token)) {
            // Step 5: Extract the email that was embedded in the token
            String email = jwtUtil.extractEmail(token);

            // Step 6: Load the full UserDetails from the database by email
            // This confirms the user still exists and gets their authorities/roles
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Step 7: Build a Spring Security authentication object
            // null for credentials because we already verified the token — no password needed
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

            // Step 8: Attach request metadata (IP address etc.) to the auth object
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // Step 9: Put the authentication into the SecurityContext
            // This is what makes the user "logged in" for the duration of this request
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // Step 10: Always continue the filter chain — let the request proceed to the controller
        filterChain.doFilter(request, response);
    }
}
