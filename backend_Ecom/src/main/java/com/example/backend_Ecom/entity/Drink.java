package com.example.backend_Ecom.entity;

import com.example.backend_Ecom.enums.DrinkType;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@Entity
@Table(name = "drinks")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drink {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    @Builder.Default
    private String category = "General";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DrinkType type = DrinkType.NORMAL;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
