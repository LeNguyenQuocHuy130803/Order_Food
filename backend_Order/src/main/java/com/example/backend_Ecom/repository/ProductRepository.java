package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Product;
import com.example.backend_Ecom.enums.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    Page<Product> findByCategory(ProductType category, Pageable pageable);

    /**
     * 🔥 Atomic DB Stock Decrease - Giảm kho trực tiếp ở DB level
     * Trả về số dòng bị ảnh hưởng (1 = thành công, 0 = không đủ kho hoặc không tìm thấy sản phẩm)
     */
    @Modifying
    @Query("UPDATE Product p SET p.quantity = p.quantity - :qty WHERE p.id = :id AND p.quantity >= :qty")
    int decreaseStockIfAvailable(@Param("id") Long id, @Param("qty") Integer qty);

    /**
     * 🔥 Atomic DB Stock Increase - Tăng/hoàn kho trực tiếp ở DB level
     */
    @Modifying
    @Query("UPDATE Product p SET p.quantity = p.quantity + :qty WHERE p.id = :id")
    int increaseStock(@Param("id") Long id, @Param("qty") Integer qty);
}
