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
import org.springframework.security.core.userdetails.UserDetailsService;
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
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    /**
     * ✅ FIX: Tạo JwtAuthenticationFilter như @Bean thay vì dùng @Component.
     * Filter này CHỈ được đăng ký vào SecurityFilterChain (addFilterBefore)
     * và KHÔNG bị Spring tự đăng ký thêm vào Servlet Filter Chain.
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService, userDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(org.springframework.security.config.Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptionHandlingCustomizer -> exceptionHandlingCustomizer
                        .authenticationEntryPoint(this.customAuthenticationEntryPoint)
                        .accessDeniedHandler(this.customAccessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        // ✅ Endpoint đổi mật khẩu yêu cầu authenticated (phải đứng trước wildcard permitAll /api/auth/**)
                        .requestMatchers(HttpMethod.PATCH, "/api/auth/change-password").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/change-password/send-otp").authenticated()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // ✅ USER ADMIN ENDPOINTS
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/paging").hasRole("ADMIN")

                        // ✅ ADDRESS ENDPOINTS - CẦN AUTHENTICATION
                        .requestMatchers("/api/users/addresses/**").authenticated()

                        // ✅ USER PERSONAL ENDPOINTS - CẦN AUTHENTICATION + OWNERSHIP CHECK TRONG SERVICE
                        .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/users/*").authenticated()

                        // ✅ PUBLIC GET — xem sản phẩm / blog không cần login (CHỈ dùng /api/products/**)
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/blogs/**").permitAll()

                        // ✅ ADMIN-ONLY — tạo / sửa / xóa sản phẩm và blog (chỉ ADMIN mới được)
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/blogs").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/blogs/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/blogs/**").hasRole("ADMIN")

                        // ✅ BLOG REVIEW — user đăng nhập mới được đánh giá
                        .requestMatchers(HttpMethod.POST, "/api/blogs/*/reviews").authenticated()

                        // ✅ CART, ORDER, PAYMENT - CẦN AUTHENTICATION
                        .requestMatchers("/api/carts/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/orders/admin/paging").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/status").hasRole("ADMIN")
                        .requestMatchers("/api/orders/**").authenticated()
                        .requestMatchers("/api/stocks/**").authenticated()
                        .requestMatchers("/api/payments/**").authenticated()

                        // ✅ MẶC ĐỊNH: Phải đăng nhập (bịt lỗ permitAll cũ)
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
