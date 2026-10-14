package com.example.backend_Ecom.filters;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import com.example.backend_Ecom.security.JwtService;
import io.jsonwebtoken.ExpiredJwtException;

/**
 * JWT Authentication Filter to validate and set authentication from JWT tokens.
 * 
 * NOTE: Intentionally NOT annotated with @Component.
 * This filter is manually registered in SecurityConfig via addFilterBefore().
 * Adding @Component would cause Spring Boot to auto-register it into the Servlet
 * filter chain, making it execute TWICE per request.
 */
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String email = null;  // Email extracted from JWT token

        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                email = this.jwtService.extractEmail(jwt);  // Extract email from token
            }

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);  // Load user by email

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authToken);  // ở đây nó sẽ làm như này khi iser gửi kèm token lên , dòng : 41 nó sẽ lấy ra email từ dãy token
                    // sau đó đến dòng 45 sẽ chạy nếu đúng là có email nó sẽ gọi đến file customUserDetailsService.java để tìm user theo email đó có trong db ko
                    // nếu có user đó nó sẽ so sánh theo code trong file jwtService : đoạn Validate access token nó sẽ check xem thử ad 2 email : email trong JWT vaf email trong db trùng ko nếu trung thì oke pass
                    //oke hết rồi , Spring sẽ coi request là đã authenticate
                    //
                }
            }
        } catch (ExpiredJwtException ex) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                "{\"status\":401,\"code\":\"TOKEN_EXPIRED\",\"message\":\"JWT token is expired\"}"
            );
            return;
        } catch (Exception ex) {
            // Token không hợp lệ hoặc lỗi parse -> log warning và cho phép filter chain tiếp tục.
            // Spring Security sẽ tự quyết định: nếu là endpoint public (permitAll) thì cho qua,
            // nếu là endpoint yêu cầu authenticated thì AuthenticationEntryPoint sẽ xử lý.
            logger.warn("JWT validation failed: " + ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}