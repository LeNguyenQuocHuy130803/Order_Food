package com.example.backend_Ecom.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import lombok.Getter;

@Configuration
public class PaymentConfig {

    // ===== PAYPAL CONFIG =====
    @Getter
    @Value("${paypal.client-id}")
    private String paypalClientId;

    @Getter
    @Value("${paypal.secret}")
    private String paypalSecret;

    @Getter
    @Value("${paypal.api}")
    private String paypalApi;

    @Getter
    @Value("${paypal.return-url}")
    private String paypalReturnUrl;

    @Getter
    @Value("${paypal.cancel-url}")
    private String paypalCancelUrl;

    /**
     * RestTemplate được cấu hình với timeout để tránh thread block vô hạn
     * khi PayPal API chậm hoặc không phản hồi
     */
    @Bean
    public RestTemplate paypalRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000); // 10 giây connect timeout
        factory.setReadTimeout(30_000);    // 30 giây read timeout
        return new RestTemplate(factory);
    }
}
