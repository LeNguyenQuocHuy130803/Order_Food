package com.example.backend_Ecom.dto;

import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "DTO for user update request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequestDto {

    private String email;
    private String userName;
    private String phoneNumber;
    private String avatarUrl;  // For passing URL (optional)
    private MultipartFile avatar;  // For form-data upload (optional)
}
