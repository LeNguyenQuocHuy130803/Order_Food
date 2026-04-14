# FILTER - HƯỚNG DẪN TRIỂN KHAI

Chức năng lọc sản phẩm theo nhiều tiêu chí.

## Thiết kế cơ sở dữ liệu

Entity phải có các trường tương ứng với tiêu chí lọc: name, category, price, region, unit, featured.

## B1: Xây dựng Repository

```java
extends JpaRepository<Drink, Long>, JpaSpecificationExecutor<Drink>
```

- `JpaSpecificationExecutor` - cho phép query động với nhiều điều kiện
- Thay vì viết hardcode query, dùng Specification xây dựng tùy ý

## B2: Xây dựng Specification

Tạo file `DrinkSpecification.java` để xây dựng logic filtering:

```java
public static Specification<Drink> filterByCriteria(List<Category> categories, Boolean featured, 
                                                    Unit unit, Long minPrice, Long maxPrice, Region region)
```

## B3: Viết logic ở Service

```java
public List<DrinkResponseDto> filterDrinks(List<Category> categories, Boolean featured, 
                                           Unit unit, Long minPrice, Long maxPrice, Region region) {
    return drinkRepository.findAll(
        DrinkSpecification.filterByCriteria(categories, featured, unit, minPrice, maxPrice, region)
    )
    .stream()
    .map(this::mapToDto)
    .collect(Collectors.toList());
}
```

## B4: Viết Controller

```java
@GetMapping("/filter")
public ResponseEntity<List<DrinkResponseDto>> filterDrinks(
        @RequestParam(required = false) List<Category> categories,
        @RequestParam(required = false) Boolean featured,
        @RequestParam(required = false) Unit unit,
        @RequestParam(required = false) Long minPrice,
        @RequestParam(required = false) Long maxPrice,
        @RequestParam(required = false) Region region) {
    return ResponseEntity.ok(drinkService.filterDrinks(categories, featured, unit, minPrice, maxPrice, region));
}
```

Endpoint: `GET /api/drinks/filter?categories=COFFEE&minPrice=20000&maxPrice=100000`
GET /api/drinks/filter?category=DRINK  (filter chỉ category)
GET /api/drinks/filter?minPrice=50000&maxPrice=200000  (lọc theo giá)