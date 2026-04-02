package com.example.backend_Ecom.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import java.util.Properties;

/**
 * Email Configuration - Loads SMTP settings from .env file via EnvLoader
 */
@Configuration
public class EmailConfig {

    /**
     * Create custom JavaMailSender that uses .env credentials
     */
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        // Load from .env file using EnvLoader
        mailSender.setHost(EnvLoader.get("MAIL_HOST"));
        mailSender.setPort(Integer.parseInt(EnvLoader.get("MAIL_PORT")));
        mailSender.setUsername(EnvLoader.get("MAIL_USERNAME"));
        mailSender.setPassword(EnvLoader.get("MAIL_PASSWORD"));

        // SMTP properties
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        return mailSender;
    }
}
