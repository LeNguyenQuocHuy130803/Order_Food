package com.example.backend_Ecom.security;

import com.example.backend_Ecom.exception.CustomAccessDeniedHandler;
import com.example.backend_Ecom.exception.CustomAuthenticationEntryPoint;
import com.example.backend_Ecom.filters.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity()
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptionHandlingCustomizer -> exceptionHandlingCustomizer
                        .authenticationEntryPoint(this.customAuthenticationEntryPoint)
                        .accessDeniedHandler(this.customAccessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                         .requestMatchers("/api/users/**").permitAll()
                        // .requestMatchers("/api/users/**", "/api/addresses/**", "/api/foods/**",
                        // "/api/drinks/**", "/api/desserts/**").authenticated()
                        // ✅ KHÔNG CẦN TOKEN (để test)
                        .requestMatchers("/api/addresses/**", "/api/foods/**", "/api/drinks/**", "/api/desserts/**").permitAll()

                        // ✅ ADMIN ONLY - Nhạy cảm (GET by ID, UPDATE, DELETE)
                        // .requestMatchers(HttpMethod.GET, "/api/users/{id}").hasRole("Administrators") // ← Chỉ Admin
//                       .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()
//                       .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasRole("Administrators") // ← Chỉ Admin
//                       .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("Administrators") // ← Chỉ Admin
//                       .requestMatchers(HttpMethod.POST, "/api/foods/**").hasRole("Administrators") // ← Chỉ Admin
//                       .requestMatchers(HttpMethod.PUT, "/api/foods/**").hasRole("Administrators")
//                       .requestMatchers(HttpMethod.DELETE, "/api/foods/**").hasRole("Administrators")

                        .anyRequest().permitAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}