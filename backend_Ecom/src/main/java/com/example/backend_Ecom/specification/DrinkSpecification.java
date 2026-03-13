package com.example.backend_Ecom.specification;

import com.example.backend_Ecom.entity.Drink;
import com.example.backend_Ecom.enums.Category;
import com.example.backend_Ecom.enums.DrinkType;
import com.example.backend_Ecom.enums.Region;
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
     * Advanced search - Tìm kiếm theo tên, description, category, region
     * @param name - Tìm kiếm theo tên (LIKE %name%, case-insensitive)
     * @param description - Tìm kiếm trong mô tả (LIKE %description%, case-insensitive)
     * @param category - Loại sản phẩm (COFFEE, MILK_TEA, JUICE, TEA)
     * @param region - Khu vực bán (HANOI, HO_CHI_MINH, DA_NANG, ...)
     * Ghi chú: Tất cả tham số đều optional (null sẽ bị skip)
     */
    public static Specification<Drink> advancedSearchCriteria(String name, String description, Category category, Region region) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Search by name (case-insensitive LIKE)
            if (name != null && !name.isBlank()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + name.toLowerCase() + "%"
                ));
            }

            // Search by description (case-insensitive LIKE)
            if (description != null && !description.isBlank()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")),
                    "%" + description.toLowerCase() + "%"
                ));
            }

            // Filter by category
            if (category != null) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // Filter by region
            if (region != null) {
                predicates.add(criteriaBuilder.equal(root.get("region"), region));
            }

            // Kết hợp tất cả điều kiện với AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Xây dựng Specification để filter theo nhiều tiêu chí
     * @param categories - Danh sách loại sản phẩm (COFFEE, MILK_TEA, JUICE, TEA) - dùng OR logic
     * @param featured - Sản phẩm nổi bật (true/false)
     * @param unit - Đơn vị (BOX, CARTON, CUP, ...)
     * @param minPrice - Giá tối thiểu
     * @param maxPrice - Giá tối đa
     * @param region - Khu vực bán (HA_NOI, HO_CHI_MINH, DA_NANG, ...)
     * Ghi chú: Tất cả tham số đều optional (null sẽ bị skip)
     *          Nhiều categories được kết hợp với OR logic
     */
    public static Specification<Drink> filterByCriteria(List<Category> categories, Boolean featured, 
                                                         Unit unit, Long minPrice, Long maxPrice, Region region) {
        return (root, query, criteriaBuilder) -> {
            // Danh sách điều kiện filter
            List<Predicate> predicates = new ArrayList<>();

            // Filter theo loại sản phẩm (Categories) - OR logic
            if (categories != null && !categories.isEmpty()) {
                Predicate[] categoryPredicates = categories.stream()
                    .map(cat -> criteriaBuilder.equal(root.get("category"), cat))
                    .toArray(Predicate[]::new);
                predicates.add(criteriaBuilder.or(categoryPredicates));
            }

            // Filter theo nổi bật (Featured)
            if (featured != null) {
                predicates.add(criteriaBuilder.equal(root.get("featured"), featured));
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

            // Filter theo khu vực (Region)
            if (region != null) {
                predicates.add(criteriaBuilder.equal(root.get("region"), region));
            }

            // Kết hợp tất cả điều kiện với AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
