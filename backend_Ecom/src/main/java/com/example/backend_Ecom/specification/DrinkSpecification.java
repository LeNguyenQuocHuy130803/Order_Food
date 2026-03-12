package com.example.backend_Ecom.specification;

import com.example.backend_Ecom.entity.Drink;
import com.example.backend_Ecom.enums.Category;
import com.example.backend_Ecom.enums.DrinkType;
import com.example.backend_Ecom.enums.Unit;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

import java.util.ArrayList;
import java.util.List;


/**
 * Xây dựng dynamic query cho filter sản phẩm
 * Cho phép kết hợp các điều kiện filter tùy ý
 */
public class DrinkSpecification {

    /**
     * Xây dựng Specification để filter theo nhiều tiêu chí
     * @param name - Tìm kiếm theo tên (LIKE %name%)
     * @param category - Loại sản phẩm (DRINK, FOOD, FRESH)
     * @param type - Chủng loại (NORMAL, FEATURED)
     * @param unit - Đơn vị (BOX, CARTON, CUP, ...)
     * @param minPrice - Giá tối thiểu
     * @param maxPrice - Giá tối đa
     * Ghi chú: Tất cả tham số đều optional (null sẽ bị skip)
     */
    public static Specification<Drink> filterByCriteria(String name, Category category, DrinkType type, 
                                                         Unit unit, Long minPrice, Long maxPrice) {
        return (root, query, criteriaBuilder) -> {
            // Danh sách điều kiện filter
            List<Predicate> predicates = new ArrayList<>();

            // Filter theo tên: LIKE '%name%' (không phân biệt hoa thường)
            if (name != null && !name.isBlank()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%"
                ));
            }

            // Filter theo loại sản phẩm (Category)
            if (category != null) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // Filter theo chủng loại (Type)
            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }

            // Filter theo đơn vị (Unit)
            if (unit != null) {
                predicates.add(criteriaBuilder.equal(root.get("unit"), unit));
            }

            // Filter theo giá tối thiểu
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            // Filter theo giá tối đa
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Kết hợp tất cả điều kiện với AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
