package com.example.backend_Ecom.security;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * JWT configuration properties loaded from application.properties
 */
@Component
@Getter
public class JwtProperties {

    @Value("${app.jwt.secret:MIsMiHz45ATNS6elM6dQLfN6oQIBDSV+KbAc5PE3rlA=}")
    private String secret;

    @Value("${app.jwt.access-token-expiration:604800000}")
    private Long accessTokenExpiration;

    @Value("${app.jwt.refresh-token-expiration:2592000000}")
    private Long refreshTokenExpiration;
}
