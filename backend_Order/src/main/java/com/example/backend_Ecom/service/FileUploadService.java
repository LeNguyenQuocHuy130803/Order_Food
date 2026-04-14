package com.example.backend_Ecom.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class FileUploadService {

    private final Cloudinary cloudinary;

    @Value("${app.file.max-size:5242880}")
    private long maxFileSize;

    @Value("${app.file.allowed-types:image/jpeg,image/png,image/gif,image/webp}")
    private String allowedTypes;

    @Value("${app.upload.folder:drinks}")
    private String uploadFolder;

    public String uploadImage(MultipartFile file) {

        validateFile(file);

        try {

            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", uploadFolder,
                            "resource_type", "auto",
                            "quality", "auto:eco"
                    )
            );

            String url = (String) result.get("secure_url");

            log.info("✓ Image uploaded: {}", url);

            return url;

        } catch (IOException e) {

            log.error("Upload failed", e);

            throw new AppException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "Upload failed"
            );
        }
    }

    private void validateFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "File is empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "File too large");
        }

        String contentType = file.getContentType();

        if (contentType == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Invalid file type");
        }

        List<String> types = Arrays.stream(allowedTypes.split(","))
                .map(String::trim)
                .toList();

        if (!types.contains(contentType)) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "File type not allowed");
        }
    }

    public void deleteImage(String url) {

        if (url == null || url.isEmpty()) return;

        try {

            String[] parts = url.split("/");
            String filename = parts[parts.length - 1].split("\\.")[0];

            String publicId = uploadFolder + "/" + filename;

            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

            log.info("✓ Image deleted");

        } catch (Exception e) {

            log.warn("Delete failed: {}", e.getMessage());

        }
    }
}