package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Fresh;    
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository cho Fresh entity
 * JpaSpecificationExecutor: cho phép dynamic query dùng Specification
 */
@Repository
public interface FreshRepository extends JpaRepository<Fresh, Long>, JpaSpecificationExecutor<Fresh> {

    // Kiểm tra tên sản phẩm đã tồn tại chưa
    boolean existsByName(String name);

    // Tìm kiếm sản phẩm theo tên (LIKE %name%, case-insensitive)
    List<Fresh> findByNameContainingIgnoreCase(String name);

    /**
     * 🔥 Optimistic stock update: Decrease quantity only if enough stock available
     * Atomic operation at DB level: UPDATE quantity = quantity - :qty WHERE id = :id AND quantity >= :qty
     * @return 1 if success (stock decreased), 0 if failed (insufficient stock)
     */
    @Modifying
    @Query(value = "UPDATE fresh SET quantity = quantity - :qty WHERE id = :id AND quantity >= :qty", nativeQuery = true)
    @Transactional
    int decreaseStockIfAvailable(@Param("id") Long id, @Param("qty") Integer qty);

    /**
     * 🔥 Restore stock on order cancellation
     * @return affected rows count
     */
    @Modifying
    @Query(value = "UPDATE fresh SET quantity = quantity + :qty WHERE id = :id", nativeQuery = true)
    @Transactional
    int increaseStock(@Param("id") Long id, @Param("qty") Integer qty);
}
