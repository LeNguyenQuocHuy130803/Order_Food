package com.example.backend_Ecom.service;

import com.example.backend_Ecom.dto.BlogRequestDto;
import com.example.backend_Ecom.dto.BlogResponseDto;
import com.example.backend_Ecom.dto.PaginatedBlogResponseDto;
import com.example.backend_Ecom.entity.Blog;
import com.example.backend_Ecom.exception.AppException;
import com.example.backend_Ecom.exception.ErrorCode;
import com.example.backend_Ecom.repository.BlogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for blog operations
 * Handles CRUD operations and pagination for blog posts
 */
@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class BlogService {

    private final BlogRepository blogRepository;
    private final FileUploadService fileUploadService;

    /**
     * Create a new blog post
     * @param request BlogRequestDto containing blog post details
     * @return BlogResponseDto with created blog post
     */
    public BlogResponseDto createBlog(BlogRequestDto request) {
        log.info("Creating new blog post: {}", request.getTitle());

        // Validate input
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Blog title cannot be empty");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Blog description cannot be empty");
        }
        if (request.getAuthor() == null || request.getAuthor().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Author cannot be empty");
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category cannot be empty");
        }

        // Check if title already exists
        if (blogRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Blog title already exists");
        }

        String uploadedImageUrl = null;
        try {
            // Handle image upload
            if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
                uploadedImageUrl = fileUploadService.uploadImage(request.getAvatar());
            } else if (request.getAvatarUrl() != null) {
                uploadedImageUrl = request.getAvatarUrl();
            }

            // Create blog post
            Blog blog = Blog.builder()
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .author(request.getAuthor())
                    .category(request.getCategory())
                    .avatar(uploadedImageUrl)
                    .commentCount(request.getCommentCount() != null ? request.getCommentCount() : 0)
                    .build();

            blog = blogRepository.save(blog);
            log.info("✓ Blog created successfully: {} (ID: {})", request.getTitle(), blog.getId());

            return mapToDto(blog);

        } catch (Exception e) {
            // COMPENSATING TRANSACTION: Delete orphaned image if DB save fails
            if (uploadedImageUrl != null && request.getAvatar() != null && !request.getAvatar().isEmpty()) {
                try {
                    fileUploadService.deleteImage(uploadedImageUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete orphaned image: {}", uploadedImageUrl);
                }
            }
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to create blog: " + e.getMessage());
        }
    }

    /**
     * Update an existing blog post
     * @param id Blog post ID
     * @param request BlogRequestDto containing updated blog post details
     * @return BlogResponseDto with updated blog post
     */
    @Transactional
    public BlogResponseDto updateBlog(Long id, BlogRequestDto request) {
        log.info("Updating blog post: {}", id);

        // Find blog post
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Blog post not found"));

        // Check if new title already exists (and it's different from current)
        if (request.getTitle() != null &&
                !blog.getTitle().equals(request.getTitle()) &&
                blogRepository.existsByTitle(request.getTitle())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Blog title already exists");
        }

        String oldImageUrl = blog.getAvatar();
        String newlyUploadedUrl = null;

        try {
            // Handle image update
            if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
                newlyUploadedUrl = fileUploadService.uploadImage(request.getAvatar());
                blog.setAvatar(newlyUploadedUrl);
            } else if (request.getAvatarUrl() != null) {
                blog.setAvatar(request.getAvatarUrl());
            }

            // Update fields
            if (request.getTitle() != null && !request.getTitle().trim().isEmpty())
                blog.setTitle(request.getTitle());
            if (request.getDescription() != null && !request.getDescription().trim().isEmpty())
                blog.setDescription(request.getDescription());
            if (request.getAuthor() != null && !request.getAuthor().trim().isEmpty())
                blog.setAuthor(request.getAuthor());
            if (request.getCategory() != null && !request.getCategory().trim().isEmpty())
                blog.setCategory(request.getCategory());
            if (request.getCommentCount() != null)
                blog.setCommentCount(request.getCommentCount());

            blog = blogRepository.save(blog);

            // Delete old image only after successfully saving to DB
            if (newlyUploadedUrl != null && oldImageUrl != null && !oldImageUrl.isEmpty()) {
                try {
                    fileUploadService.deleteImage(oldImageUrl);
                } catch (Exception ex) {
                    log.warn("⚠️ Failed to delete old image: {}", oldImageUrl);
                }
            }

            log.info("✓ Blog updated successfully: {}", id);
            return mapToDto(blog);

        } catch (Exception e) {
            // COMPENSATING TRANSACTION: Delete newly uploaded image if update fails
            if (newlyUploadedUrl != null) {
                try {
                    fileUploadService.deleteImage(newlyUploadedUrl);
                } catch (Exception ex) {
                    log.error("Failed to delete orphaned new image: {}", newlyUploadedUrl);
                }
            }
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to update blog: " + e.getMessage());
        }
    }

    /**
     * Delete a blog post
     * @param id Blog post ID
     */
    @Transactional
    public void deleteBlog(Long id) {
        log.info("Deleting blog post: {}", id);

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Blog post not found"));

        blogRepository.delete(blog);
        blogRepository.flush();

        // Delete image from Cloudinary only after DB commit succeeds
        if (blog.getAvatar() != null && !blog.getAvatar().isEmpty()) {
            try {
                fileUploadService.deleteImage(blog.getAvatar());
            } catch (Exception e) {
                log.warn("⚠️ Blog {} deleted but Cloudinary image deletion failed: {}", id, e.getMessage());
                // Don't fail - DB deletion already succeeded
            }
        }

        log.info("✓ Blog deleted successfully: {}", id);
    }

    /**
     * Get blog post by ID
     * @param id Blog post ID
     * @return BlogResponseDto
     */
    public BlogResponseDto getBlogById(Long id) {
        log.info("Fetching blog post: {}", id);

        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Blog post not found"));

        return mapToDto(blog);
    }

    /**
     * Get all blog posts with pagination
     * @param page Page number (1-based)
     * @param size Number of items per page
     * @return PaginatedBlogResponseDto
     */
    public PaginatedBlogResponseDto getAllBlogsPaginated(int page, int size) {
        log.info("Fetching all blog posts - page: {}, size: {}", page, size);

        // Validate and normalize pagination parameters
        if (page < 1) page = 1;
        if (size < 1) size = 10;

        // Convert 1-based page to 0-based for Spring Data
        Pageable pageable = PageRequest.of(page - 1, size);

        // Get paginated data from repository
        Page<Blog> blogPage = blogRepository.findAll(pageable);

        // Convert Page<Blog> to List<BlogResponseDto>
        List<BlogResponseDto> blogDtos = blogPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        // Build response with pagination info (convert back to 1-based)
        return PaginatedBlogResponseDto.builder()
                .data(blogDtos)
                .pageNumber(blogPage.getNumber() + 1)      // Convert back to 1-based
                .pageSize(blogPage.getSize())
                .totalRecords(blogPage.getTotalElements())
                .totalPages(blogPage.getTotalPages())
                .hasNext(blogPage.hasNext())
                .hasPrevious(blogPage.hasPrevious())
                .build();
    }

    /**
     * Get all blog posts (non-paginated)
     * @return List of BlogResponseDto
     */
    public List<BlogResponseDto> getAllBlogs() {
        log.info("Fetching all blog posts (non-paginated)");

        return blogRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Map Blog entity to BlogResponseDto
     * @param blog Blog entity
     * @return BlogResponseDto
     */
    private BlogResponseDto mapToDto(Blog blog) {
        return BlogResponseDto.builder()
                .id(blog.getId())
                .title(blog.getTitle())
                .description(blog.getDescription())
                .avatar(blog.getAvatar())
                .author(blog.getAuthor())
                .category(blog.getCategory())
                .commentCount(blog.getCommentCount())
                .createdAt(blog.getCreatedAt())
                .updatedAt(blog.getUpdatedAt())
                .build();
    }
}
