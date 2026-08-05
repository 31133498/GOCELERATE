package com.gocelerate.gocelerate.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// @Component registers this class as a Spring-managed bean so it can be injected anywhere
@Component
public class JwtUtil {

    // @Value reads the property from application.properties at startup
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Derives a cryptographic SecretKey from the plain text secret string
    // Keys.hmacShaKeyFor() ensures the key meets the minimum size for HMAC-SHA256
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // Builds a signed JWT containing the user's email as the "subject" claim
    // The token is signed with our secret key — any tampering will fail validation
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)                                         // who the token is about
                .issuedAt(new Date())                                   // when it was issued
                .expiration(new Date(System.currentTimeMillis() + expiration)) // when it expires
                .signWith(getSigningKey())                              // signs with HS256
                .compact();                                             // serialises to the JWT string
    }

    // Parses and validates the token, then extracts the email from the subject claim
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())  // verifies the signature — throws if tampered
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Returns true only if the token signature is valid and it has not expired
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // JwtException covers: expired, malformed, wrong signature
            return false;
        }
    }
}
