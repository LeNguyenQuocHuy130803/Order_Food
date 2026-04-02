package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Dessert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho Dessert entity
 * JpaSpecificationExecutor: cho phép dynamic query dùng Specification
 */
@Repository
public interface DessertRepository extends JpaRepository<Dessert, Long>, JpaSpecificationExecutor<Dessert> {

    // Kiểm tra tên sản phẩm đã tồn tại chưa
    boolean existsByName(String name);

    // Tìm kiếm sản phẩm theo tên (LIKE %name%, case-insensitive)
    List<Dessert> findByNameContainingIgnoreCase(String name);
}
