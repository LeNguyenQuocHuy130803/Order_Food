package com.example.backend_Ecom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendEcomApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendEcomApplication.class, args);
	}

}
