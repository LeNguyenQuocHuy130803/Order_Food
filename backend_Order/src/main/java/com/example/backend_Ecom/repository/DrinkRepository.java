package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Drink;    
import org.springframework.data.jpa.repository.JpaRepository;  // JpaRepository là interface của Spring Data JPA giúp tự động tạo các chức năng. giúp sdung dc Ví dụ các method có sẵn: save, findByID, findAll, deleteById, ...
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Repository cho Drink entity
 * JpaSpecificationExecutor: cho phép dynamic query dùng Specification
 */
@Repository
public interface DrinkRepository extends JpaRepository<Drink, Long>, JpaSpecificationExecutor<Drink> {  // Specification<Drink> là để dùng cho dynamic query trong filter sản phẩm theo nhiều tiêu chí khác nhau (name, category, type, unit, price range)
// khi dùng JpaRepository<Drink, Long> thì Drink là entity và Long là kiểu dữ liệu của ID của Drink , khi dùng JpaRepository như thế sẽ dùng được các pthuc của nó : save, findByID, findAll, deleteById, ... còn JpaSpecificationExecutor<Drink> là để dùng cho dynamic query trong filter sản phẩm theo nhiều tiêu chí khác nhau (name, category, type, unit, price range)
/**
drinkRepository.save(drink);
drinkRepository.findById(id);
drinkRepository.findAll();
drinkRepository.deleteById(id);

 */
    // Kiểm tra tên sản phẩm đã tồn tại chưa
    boolean existsByName(String name);

    // Tìm kiếm sản phẩm theo tên (LIKE %name%, case-insensitive)
    List<Drink> findByNameContainingIgnoreCase(String name);

    /**
     * 🔥 Optimistic stock update: Decrease quantity only if enough stock available
     * Atomic operation at DB level: UPDATE quantity = quantity - :qty WHERE id = :id AND quantity >= :qty
     * @return 1 if success (stock decreased), 0 if failed (insufficient stock)
     */
    @Modifying
    @Query(value = "UPDATE drinks SET quantity = quantity - :qty WHERE id = :id AND quantity >= :qty", nativeQuery = true)
    @Transactional
    int decreaseStockIfAvailable(@Param("id") Long id, @Param("qty") Integer qty);

    /**
     * 🔥 Restore stock on order cancellation
     * @return affected rows count
     */
    @Modifying
    @Query(value = "UPDATE drinks SET quantity = quantity + :qty WHERE id = :id", nativeQuery = true)
    @Transactional
    int increaseStock(@Param("id") Long id, @Param("qty") Integer qty);
}
