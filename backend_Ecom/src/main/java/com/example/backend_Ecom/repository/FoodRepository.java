package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Food;    
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho Food entity
 * JpaSpecificationExecutor: cho phép dynamic query dùng Specification
 */
@Repository
public interface FoodRepository extends JpaRepository<Food, Long>, JpaSpecificationExecutor<Food> {

    // Kiểm tra tên sản phẩm đã tồn tại chưa
    boolean existsByName(String name);

    // Tìm kiếm sản phẩm theo tên (LIKE %name%, case-insensitive)
    List<Food> findByNameContainingIgnoreCase(String name);
}
