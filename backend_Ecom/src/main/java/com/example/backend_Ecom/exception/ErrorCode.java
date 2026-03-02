package com.example.backend_Ecom.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Enumeration of application-specific error codes
 */
@Getter
@AllArgsConstructor
public enum ErrorCode {
    // Authentication & Authorization (4xx)
    UNAUTHORIZED(401, "UNAUTHORIZED", "Authentication required"),
    FORBIDDEN(403, "FORBIDDEN", "Access denied"),
    INVALID_CREDENTIALS(401, "INVALID_CREDENTIALS", "Invalid email or password"),
    TOKEN_EXPIRED(401, "TOKEN_EXPIRED", "Token has expired"),
    INVALID_TOKEN(401, "INVALID_TOKEN", "Invalid or malformed token"),
    
    // Validation (400)
    BAD_REQUEST(400, "BAD_REQUEST", "Invalid request"),
    INVALID_INPUT(400, "INVALID_INPUT", "Invalid input provided"),
    EMAIL_ALREADY_EXISTS(400, "EMAIL_ALREADY_EXISTS", "Email already exists"),
    PHONE_ALREADY_EXISTS(400, "PHONE_ALREADY_EXISTS", "Phone number already exists"),
    
    // Not Found (404)
    USER_NOT_FOUND(404, "USER_NOT_FOUND", "User not found"),
    ROLE_NOT_FOUND(404, "ROLE_NOT_FOUND", "Role not found"),
    RESOURCE_NOT_FOUND(404, "RESOURCE_NOT_FOUND", "Resource not found"),
    
    // Internal Server Error (500)
    INTERNAL_SERVER_ERROR(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred"),
    DATABASE_ERROR(500, "DATABASE_ERROR", "Database operation failed"),
    CONFIGURATION_ERROR(500, "CONFIGURATION_ERROR", "Configuration error");

    private final int httpStatus;
    private final String code;
    private final String message;

    public HttpStatus getHttpStatusCode() {
        return HttpStatus.valueOf(httpStatus);
    }
}
