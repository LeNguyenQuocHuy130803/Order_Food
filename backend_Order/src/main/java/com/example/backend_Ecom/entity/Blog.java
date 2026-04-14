package com.example.backend_Ecom.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "blog")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summary;  // Short description for list page

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;  // Full HTML content for detail page

    @Column(name = "avatar_url")
    private String avatar;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false)
    private String category;  // Recipes, Tips, News, etc.


    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
