# Giải Thích Chức Năng Upload Ảnh Bằng Cloudinary

## Phần 1: Upload Ảnh Cho Food, Fresh, Drink

### 1.1 Các File Liên Quan

#### A. **Controller Layer**
- `FoodController.java` - `/api/foods` (POST - tạo food)
- `DrinkController.java` - `/api/drinks` (POST - tạo drink)  
- `FreshController.java` - `/api/fresh` (POST - tạo fresh)

**Đặc điểm chung:** Tất cả đều có endpoint POST với decorator:
```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> create(@ModelAttribute [RequestDto] request) {
    // Process
}
```

**Chi tiết:**
- `@ModelAttribute` - cho phép nhận dữ liệu dạng form-data (không phải JSON)
- `consumes = MediaType.MULTIPART_FORM_DATA_VALUE` - bảo server chấp nhận form-data content-type
- `[RequestDto]` - tương ứng là `FoodRequestDto`, `DrinkRequestDto`, `FreshRequestDto`

#### B. **Request DTO Layer**
- `FoodRequestDto.java`
- `DrinkRequestDto.java`
- `FreshRequestDto.java`

**Cấu trúc chung:**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class [Name]RequestDto {
    private String name;
    private String description;
    private Double price;
    // ... các trường khác
    
    // Trường đặc biệt cho ảnh
    private MultipartFile image;        // ← File ảnh từ máy tính
    private String imageUrl;            // ← Hoặc URL trực tiếp
}
```

**Lưu ý:** Có 2 cách upload:
1. **MultipartFile image** - chọn file từ máy
2. **String imageUrl** - gửi URL trực tiếp (nếu không upload file)

#### C. **Service Layer**
- `FoodService.java`
- `DrinkService.java`
- `FreshService.java`

**Phương thức chính: `resolveImage()`**

```java
private String resolveImage(FoodRequestDto request) {
    // Nếu có file upload
    if (request.getImage() != null && !request.getImage().isEmpty()) {
        return fileUploadService.uploadImage(request.getImage());
    }
    // Nếu gửi URL trực tiếp
    if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
        return request.getImageUrl();
    }
    // Nếu không có ảnh nào
    return null;
}
```

**Quy trình:**
1. Kiểm tra có MultipartFile hay không
2. Nếu có → gọi `fileUploadService.uploadImage()` (upload lên Cloudinary)
3. Nếu không có file nhưng có URL → dùng URL
4. Nếu không có gì → return null

#### D. **FileUploadService.java** - Core Cloudinary Integration

**Đây là file quan trọng nhất!** Chứa logic upload/delete ảnh lên Cloudinary.

**2 phương thức chính:**

```java
public String uploadImage(MultipartFile file) {
    // 1. Tạo Map cấu hình cho Cloudinary
    // 2. Upload file lên Cloudinary
    // 3. Trả về URL của ảnh trên Cloudinary
}

public void deleteImage(String imageUrl) {
    // 1. Parse URL để lấy public_id
    // 2. Xóa ảnh từ Cloudinary
}
```

**Cấu hình Cloudinary:**
- **CLOUDINARY_URL** - biến môi trường chứa: `cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]`
- Được cấu hình trong `application.properties` hoặc `application.yml`

#### E. **Entity Layer**
- `Food.java`
- `Drink.java`
- `Fresh.java`

**Cấu trúc:**
```java
@Entity
@Table(name = "foods")
public class Food {
    @Column(name = "image_url")
    private String imageUrl;  // ← Lưu URL từ Cloudinary
}
```

### 1.2 Quy Trình Upload Ảnh Chi Tiết

```
CLIENT (Postman)
    ↓ (gửi form-data với file)
    ↓
CONTROLLER (FoodController.create)
    ├─ @ModelAttribute binding → FoodRequestDto
    ↓
SERVICE (FoodService.create)
    ├─ Gọi resolveImage(request)
    ├─ Kiểm tra request.getImage() không null
    ↓
FILE UPLOAD SERVICE (FileUploadService.uploadImage)
    ├─ Gửi file tới Cloudinary API
    ├─ Cloudinary xử lý & lưu ảnh
    ├─ Trả về URL: https://res.cloudinary.com/.../image.jpg
    ↓
SERVICE (FoodService.create) tiếp tục
    ├─ Lấy URL từ FileUploadService
    ├─ Set imageUrl vào Food entity
    ├─ Save vào Database
    ↓
DATABASE
    └─ Lưu URL vào cột image_url
```

### 1.3 Ví Dụ Postman Request

**Endpoint:** `POST http://localhost:8080/api/foods`

**Headers:**
- `Content-Type: form-data` (Postman tự set khi dùng form-data)
- `Authorization: Bearer [JWT_TOKEN]`

**Body (form-data):**
```
name           → "Cơm Gà"
description    → "Cơm gà hải nam"
price          → 25000
image          → [Chọn file từ máy] ← MultipartFile
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Cơm Gà",
        "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/food_abc123.jpg",
        "price": 25000
    }
}
```

---

## Phần 2: Update Avatar Cho User

### 2.1 Các File Liên Quan

#### A. **Controller Layer**
- `UserController.java` - `/api/users/{id}` (PUT - update user)

**Endpoint:**
```java
@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> updateUser(
    @PathVariable Long id,
    @ModelAttribute UserUpdateRequestDto request
) {
    // Process
}
```

**Điểm khác với Food/Drink/Fresh:** Cần cập nhật thêm thông tin khác ngoài avatar

#### B. **Request DTO Layer**
- `UserUpdateRequestDto.java`

**Cấu trúc:**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequestDto {
    private String email;               // Email mới (optional)
    private String phoneNumber;         // SĐT mới (optional)
    private String addressHome;         // Địa chỉ nhà (optional)
    private String addressWork;         // Địa chỉ công ty (optional)
    
    // Avatar - 2 cách tương tự như food/drink/fresh
    private MultipartFile avatar;       // ← Upload file từ máy
    private String avatarUrl;           // ← Hoặc URL trực tiếp
}
```

**Đặc điểm:**
- Tất cả trường đều **optional** (có thể cập nhật một phần)
- `avatar` và `avatarUrl` không bắt buộc - nếu không gửi thì avatar cũ được giữ

#### C. **Service Layer**
- `UserService.java`

**Phương thức chính: `updateUser()`**

```java
public UserResponseDto updateUser(Long id, UserUpdateRequestDto request) {
    User user = userJpaRepository.findById(id)
        .orElseThrow(() -> new NotFoundException("User not found"));
    
    // 1. Cập nhật email
    if (request.getEmail() != null) {
        // Kiểm tra email đã tồn tại không
        user.setEmail(request.getEmail());
    }
    
    // 2. Cập nhật phone
    if (request.getPhoneNumber() != null) {
        user.setPhoneNumber(request.getPhoneNumber());
    }
    
    // 3. Cập nhật địa chỉ
    if (request.getAddressHome() != null) {
        user.setAddressHome(request.getAddressHome());
    }
    if (request.getAddressWork() != null) {
        user.setAddressWork(request.getAddressWork());
    }
    
    // 4. Xử lý avatar - gọi resolveAvatar()
    String avatarUrl = resolveAvatar(request, user.getAvatarUrl());
    user.setAvatarUrl(avatarUrl);
    
    // 5. Save vào database
    User updatedUser = userJpaRepository.save(user);
    
    return mapToDto(updatedUser);
}
```

**Phương thức: `resolveAvatar()`**

```java
private String resolveAvatar(UserUpdateRequestDto request, String currentAvatar) {
    // Trường hợp 1: Có file upload mới
    if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
        // Xóa ảnh cũ từ Cloudinary (nếu có)
        if (currentAvatar != null) {
            fileUploadService.deleteImage(currentAvatar);
        }
        // Upload ảnh mới
        return fileUploadService.uploadImage(request.getAvatar());
    }
    
    // Trường hợp 2: Gửi URL trực tiếp
    if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
        // Xóa ảnh cũ (nếu có) khi thay URL mới
        if (currentAvatar != null) {
            fileUploadService.deleteImage(currentAvatar);
        }
        return request.getAvatarUrl();
    }
    
    // Trường hợp 3: Không gửi avatar → giữ nguyên avatar cũ
    return currentAvatar;
}
```

#### D. **Entity Layer**
- `User.java`

**Cậu trúc:**
```java
@Entity
@Table(name = "users")
public class User {
    @Column(name = "avatar_url")
    private String avatarUrl;          // ← URL avatar từ Cloudinary
    
    @Column(name = "address_home", columnDefinition = "TEXT")
    private String addressHome;        // ← Địa chỉ nhà
    
    @Column(name = "address_work", columnDefinition = "TEXT")
    private String addressWork;        // ← Địa chỉ công ty
    
    // ... fields khác
}
```

#### E. **Response DTO**
- `UserResponseDto.java`

**Cấu trúc:**
```java
@Data
@Builder
public class UserResponseDto {
    private Long id;
    private String email;
    private String userName;
    private String phoneNumber;
    private String avatarUrl;          // ← Trả về URL
    private String addressHome;
    private String addressWork;
    private String role;
}
```

### 2.2 Quy Trình Update Avatar Chi Tiết

```
CLIENT (Postman)
    ↓ (gửi form-data với file avatar mới)
    ↓
CONTROLLER (UserController.updateUser)
    ├─ @ModelAttribute binding → UserUpdateRequestDto
    ├─ @PathVariable id → User ID cần update
    ↓
SERVICE (UserService.updateUser)
    ├─ Tìm User từ database bằng id
    ├─ Cập nhật các trường (email, phone, address)
    ├─ Gọi resolveAvatar(request, currentAvatar)
    ↓
resolveAvatar() xử lý avatar
    ├─ Kiểm tra có MultipartFile hay không
    ├─ Nếu có:
    │   ├─ Xóa avatar cũ từ Cloudinary
    │   ├─ Upload avatar mới
    │   └─ Trả về URL mới
    ├─ Nếu không có file nhưng có URL:
    │   ├─ Xóa avatar cũ
    │   └─ Dùng URL mới
    └─ Nếu không có gì:
        └─ Giữ nguyên avatar cũ

SERVICE tiếp tục
    ├─ Set avatarUrl mới vào User entity
    ├─ Save vào Database
    ├─ Gọi mapToDto() để convert sang DTO
    ↓
DATABASE
    └─ Cập nhật các cột (avatar_url, address_home, address_work, email, phone_number)
```

### 2.3 Ví Dụ Postman Request

**Endpoint:** `PUT http://localhost:8080/api/users/1`

**Headers:**
- `Content-Type: form-data` (Postman tự set)
- `Authorization: Bearer [JWT_TOKEN]`

**Body (form-data):**

#### Scenario 1: Upload file avatar + cập nhật địa chỉ
```
avatar         → [Chọn file từ máy]
addressHome    → "123 Đường A, TP.HCM"
addressWork    → "456 Phố B, Hà Nội"
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "user@example.com",
        "userName": "username",
        "phoneNumber": "0901234567",
        "avatarUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/user_avatar_xyz.jpg",
        "addressHome": "123 Đường A, TP.HCM",
        "addressWork": "456 Phố B, Hà Nội",
        "role": "USER"
    }
}
```

#### Scenario 2: Chỉ cập nhật email, giữ nguyên avatar
```
email          → "newemail@example.com"
```

**Response:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "newemail@example.com",
        "userName": "username",
        "phoneNumber": "0901234567",
        "avatarUrl": "https://res.cloudinary.com/.../user_avatar_xyz.jpg",  // ← Vẫn giữ cũ
        "addressHome": "123 Đường A, TP.HCM",
        "addressWork": "456 Phố B, Hà Nội",
        "role": "USER"
    }
}
```

#### Scenario 3: Gửi URL avatar trực tiếp (không upload file)
```
avatarUrl      → "https://example.com/my-avatar.jpg"
addressHome    → "999 Đường C"
```

---

## Phần 3: So Sánh Food/Drink/Fresh vs User

| Tiêu chí | Food/Drink/Fresh | User |
|---------|------------------|------|
| **Controller Endpoint** | `POST /api/foods` | `PUT /api/users/{id}` |
| **Content Type** | `MULTIPART_FORM_DATA_VALUE` | `MULTIPART_FORM_DATA_VALUE` |
| **DTO Binding** | `@ModelAttribute` | `@ModelAttribute` |
| **File Field Name** | `image` | `avatar` |
| **URL Field Name** | `imageUrl` | `avatarUrl` |
| **Resolve Method** | `resolveImage()` | `resolveAvatar()` |
| **Logic** | Tạo mới entity | Cập nhật entity + xóa ảnh cũ |
| **Bắt buộc ảnh** | Có thể bắt buộc | Tùy chọn (có thể giữ cũ) |

---

## Phần 4: FileUploadService - Chi Tiết Kỹ Thuật

### 4.1 Cấu Hình Cloudinary

**File:** `application.properties` hoặc `application.yml`

```properties
# Cloudinary Configuration
cloudinary.url=cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]
```

### 4.2 Phương Thức uploadImage()

```java
public String uploadImage(MultipartFile file) throws IOException {
    // 1. Chuẩn bị upload params
    Map uploadParams = new HashMap();
    uploadParams.put("resource_type", "auto");  // Tự nhận diện loại file
    uploadParams.put("folder", "food-fresh");   // Thư mục lưu trên Cloudinary
    
    // 2. Upload file
    Map result = cloudinary.uploader().upload(file.getBytes(), uploadParams);
    
    // 3. Trả về URL
    return result.get("secure_url").toString();
    // Ví dụ: https://res.cloudinary.com/your-cloud/image/upload/v123/food-fresh/image.jpg
}
```

### 4.3 Phương Thức deleteImage()

```java
public void deleteImage(String imageUrl) throws IOException {
    // 1. Parse URL để lấy public_id
    String publicId = extractPublicId(imageUrl);
    // Ví dụ: public_id = "food-fresh/image"
    
    // 2. Xóa ảnh từ Cloudinary
    Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    
    // result.get("result") sẽ là "ok" nếu xóa thành công
}
```

### 4.4 Lợi Ích Cloudinary

- **Tự động resize & optimize** ảnh
- **CDN toàn cầu** - load ảnh nhanh từ bất kỳ đâu
- **Bảo mật** - upload không cần expose sensitive key
- **Dễ quản lý** - có dashboard của Cloudinary

---

## Tóm Tắt

### Upload Ảnh Cho Food/Drink/Fresh:
1. **Controller** nhận form-data qua `@ModelAttribute`
2. **Service** gọi `resolveImage()` để xử lý file
3. **FileUploadService** upload lên Cloudinary, trả URL
4. **Entity** lưu URL vào database
5. **Response** trả về object kèm URL ảnh

### Update Avatar Cho User:
1. **Controller** nhận form-data PUT request
2. **Service** cập nhật các trường + gọi `resolveAvatar()`
3. **resolveAvatar()** xử lý:
   - Nếu có file mới → xóa cũ, upload mới
   - Nếu có URL mới → xóa cũ, dùng URL
   - Nếu không → giữ cũ
4. **Entity** lưu avatar URL mới (hoặc cũ)
5. **Response** trả về User object cập nhật

**Điểm chung:** Đều dùng `FileUploadService` và Cloudinary để quản lý ảnh!
