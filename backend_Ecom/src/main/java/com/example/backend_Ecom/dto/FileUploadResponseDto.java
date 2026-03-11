package com.example.backend_Ecom.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponseDto {
    private String url;
    private String filename;
    private String message;
}
