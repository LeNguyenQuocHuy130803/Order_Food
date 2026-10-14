package com.example.backend_Ecom.security;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * JWT configuration properties loaded from application.properties
 */
@Slf4j
@Component
@Getter
public class JwtProperties {

    private static final String DEFAULT_DEV_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-token-expiration:900000}")
    private Long accessTokenExpiration;

    @Value("${app.jwt.refresh-token-expiration:2160000000}")
    private Long refreshTokenExpiration;

    @PostConstruct
    public void validate() {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException("JWT Secret is not configured! Please configure 'app.jwt.secret' or 'JWT_SECRET'.");
        }
        if (DEFAULT_DEV_SECRET.equals(secret.trim())) {
            log.warn("⚠️ [SECURITY WARNING] Default hardcoded development JWT secret is in use. Please set the JWT_SECRET environment variable for production environments!");
        }
    }
}
