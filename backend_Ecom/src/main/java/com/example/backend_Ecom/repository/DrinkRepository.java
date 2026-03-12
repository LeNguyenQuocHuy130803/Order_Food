package com.example.backend_Ecom.repository;

import com.example.backend_Ecom.entity.Drink;    
import org.springframework.data.jpa.repository.JpaRepository;  // JpaRepository là interface của Spring Data JPA giúp tự động tạo các chức năng. giúp sdung dc Ví dụ các method có sẵn: save, findByID, findAll, deleteById, ...
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

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
}
