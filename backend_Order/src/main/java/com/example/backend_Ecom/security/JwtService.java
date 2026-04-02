package com.example.backend_Ecom.security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import com.example.backend_Ecom.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

/**
 * Service for JWT token generation and validation
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    private SecretKey getSigningKey() {
        byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Generate access token for user authentication  ; tạo ra access token để xác thực người dùng
     */
    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("type", "access_token");

        //  cách cũ lấy time tại file 
    // long jwtExpiration = 7 * 24 * 60 * 60 * 1000; // 7 days
    // return createToken(claims, user.getEmail(), jwtExpiration);

    //  cách mới lấy time để access token hoạt động từ file application.properties 
        return createToken(claims, user.getEmail(), jwtProperties.getAccessTokenExpiration());
    }

    /**
     * Generate refresh token for obtaining new access tokens  : tạo ra refresh token để lấy access token mới khi access token cũ hết hạn
     */
    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", user.getId());
        claims.put("type", "refresh_token");

        //  tường tự như access token, lấy time tại file application.properties 
        return createToken(claims, user.getEmail(), jwtProperties.getRefreshTokenExpiration());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extract email from JWT token (stored as subject)
     * Note: Despite Spring Security's naming conventions, this extracts EMAIL not username
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Validate access token
     */
    public Boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        final String tokenType = extractTokenType(token);
        return (email.equals(userDetails.getUsername()))
                && !isTokenExpired(token)
                && "access_token".equals(tokenType);
    }

    /**
     * Validate refresh token
     */
    public Boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        final String tokenType = extractTokenType(token);

        return (email.equals(userDetails.getUsername()))
                && !isTokenExpired(token)
                && "refresh_token".equals(tokenType);
    }
}