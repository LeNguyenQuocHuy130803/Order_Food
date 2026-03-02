package com.example.backend_Ecom.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Global exception handler for the application
 * Handles all exceptions and returns standardized error responses
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle custom application exceptions
     */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException ex, WebRequest request) {
        ErrorCode errorCode = ex.getErrorCode();
        
        log.warn("Application exception occurred: {} - {}", errorCode.getCode(), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(errorCode.getHttpStatus())
                .code(errorCode.getCode())
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(errorCode.getHttpStatusCode())
                .body(errorResponse);
    }

    /**
     * Handle validation errors from @Valid annotation
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.add(error.getField() + ": " + error.getDefaultMessage())
        );
        
        log.warn("Validation error occurred: {}", errors);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(400)
                .code("VALIDATION_ERROR")
                .message("Validation failed")
                .details(errors)
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(LocalDateTime.now())
                .build();
        
        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle HTTP exception (custom exception for HTTP status codes)
     * Deprecated: Use AppException instead
     */
    @ExceptionHandler(HttpException.class)
    public ResponseEntity<ErrorResponse> handleHttpException(HttpException ex, WebRequest request) {
        log.warn("HTTP exception occurred: {} - {}", ex.getStatus(), ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(ex.getStatus().value())
                .code(ex.getStatus().name())
                .message(ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(ex.getStatus())
                .body(errorResponse);
    }

    /**
     * Handle authentication exceptions
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, WebRequest request) {
        
        log.warn("Authentication failed: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(401)
                .code("AUTHENTICATION_FAILED")
                .message("Authentication failed: " + ex.getMessage())
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(401).body(errorResponse);
    }

    /**
     * Handle access denied exceptions
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        
        log.warn("Access denied: {}", ex.getMessage());
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(403)
                .code("ACCESS_DENIED")
                .message("You do not have permission to access this resource")
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.status(403).body(errorResponse);
    }

    /**
     * Handle database constraint violations
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, WebRequest request) {
        
        log.error("Database integrity violation occurred", ex);
        
        String message = "Database operation failed";
        // Check for specific constraint violations
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("email")) {
                message = "Email already exists";
            } else if (ex.getMessage().contains("phone")) {
                message = "Phone number already exists";
            } else if (ex.getMessage().contains("unique")) {
                message = "Record already exists";
            }
        }
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(400)
                .code("DATA_INTEGRITY_ERROR")
                .message(message)
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    /**
     * Handle all uncaught exceptions - Fallback handler
     * This is the last resort for unexpected errors
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {
        
        log.error("Unexpected exception occurred", ex);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(500)
                .code("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred. Please contact support if the problem persists.")
                .path(request.getDescription(false).replace("uri=", ""))
                .timestamp(LocalDateTime.now())
                .build();

        return ResponseEntity
                .status(500)
                .body(errorResponse);
    }
}