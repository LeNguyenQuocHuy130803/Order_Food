package com.example.backend_Ecom.controller;

import com.example.backend_Ecom.dto.BlogRequestDto;
import com.example.backend_Ecom.dto.BlogResponseDto;
import com.example.backend_Ecom.dto.MessageResponseDto;
import com.example.backend_Ecom.dto.PaginatedBlogResponseDto;
import com.example.backend_Ecom.service.BlogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import java.util.List;

@Tag(name = "Blog", description = "Blog operations - CRUD and pagination")
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService blogService;

    /**
     * GET /api/blogs?page=1&size=10
     * Get all blog posts with pagination
     * Frontend: Lấy danh sách bài viết blog theo trang
     */
    @Operation(summary = "Get all blog posts with pagination")
    @GetMapping
    public ResponseEntity<PaginatedBlogResponseDto> getAllBlogs(
            @Parameter(description = "Page number (1-based)", example = "1")
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @Parameter(description = "Items per page", example = "10")
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        return ResponseEntity.ok(blogService.getAllBlogsPaginated(page, size));
    }

    /**
     * GET /api/blogs/{id}
     * Get blog post by ID
     * Frontend: Lấy chi tiết một bài viết blog
     */
    @Operation(summary = "Get blog post by ID")
    @GetMapping("/{id}")
    public ResponseEntity<BlogResponseDto> getBlogById(
            @Parameter(description = "Blog post ID") @PathVariable @Min(1) Long id) {
        return ResponseEntity.ok(blogService.getBlogById(id));
    }

    /**
     * GET /api/blogs/all/list
     * Get all blog posts (non-paginated)
     * Used for dropdowns or when all data needed at once
     */
    @Operation(summary = "Get all blog posts without pagination")
    @GetMapping("/all/list")
    public ResponseEntity<List<BlogResponseDto>> getAllBlogsNoPagination() {
        return ResponseEntity.ok(blogService.getAllBlogs());
    }

    /**
     * POST /api/blogs
     * Create a new blog post with image upload
     * Frontend: Gửi form data với file upload
     * 
     * Request (multipart/form-data):
     * - title: "The Secret to Perfect Fried Chicken"
     * - description: "Learn the techniques our chefs use..."
     * - author: "Chef Thomas"
     * - category: "Recipes"
     * - avatar: <binary file>
     */
    @Operation(summary = "Create a new blog post")
    @PostMapping
    public ResponseEntity<BlogResponseDto> createBlog(
            @Valid @ModelAttribute BlogRequestDto request) {
        BlogResponseDto created = blogService.createBlog(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/blogs/{id}
     * Update an existing blog post
     * Frontend: Update bài viết với file upload lựa chọn
     */
    @Operation(summary = "Update blog post")
    @PatchMapping("/{id}")
    public ResponseEntity<BlogResponseDto> updateBlog(
            @Parameter(description = "Blog post ID") @PathVariable @Min(1) Long id,
            @Valid @ModelAttribute BlogRequestDto request) {
        return ResponseEntity.ok(blogService.updateBlog(id, request));
    }

    /**
     * DELETE /api/blogs/{id}
     * Delete a blog post
     * Frontend: Xóa bài viết (kèm xóa ảnh trên Cloudinary)
     */
    @Operation(summary = "Delete blog post")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponseDto> deleteBlog(
            @Parameter(description = "Blog post ID") @PathVariable @Min(1) Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.ok(new MessageResponseDto(true, "Blog post deleted successfully"));
    }
}
