package com.example.backend_Ecom.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        String cloudName = EnvLoader.get("CLOUDINARY_CLOUD_NAME");
        String apiKey = EnvLoader.get("CLOUDINARY_API_KEY");
        String apiSecret = EnvLoader.get("CLOUDINARY_API_SECRET");

        if (cloudName == null || apiKey == null || apiSecret == null) {
            throw new IllegalStateException("Cloudinary credentials missing");
        }

        log.info("✓ Cloudinary initialized");
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }
}
