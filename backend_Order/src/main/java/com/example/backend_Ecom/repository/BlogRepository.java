package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    
    Optional<Blog> findByTitle(String title);
    
    boolean existsByTitle(String title);
}
