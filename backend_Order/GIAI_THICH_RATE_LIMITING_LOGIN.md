# 🛡️ GIẢI THÍCH CHI TIẾT: RATE LIMITING (Giới hạn tần suất yêu cầu)

> **Dự án:** Web Order Food  
> **Ngày thêm:** 2026-09-27  
> **Thư viện sử dụng:** Bucket4j (Token Bucket Algorithm)  
> **Mục đích:** Bảo vệ các API xác thực (login, register, gửi OTP) khỏi bị spam hoặc brute-force.

---

## 📖 MỤC LỤC

1. [Rate Limiting là gì? Tại sao cần?](#1-rate-limiting-là-gì-tại-sao-cần)
2. [Thuật toán Token Bucket — Cách Bucket4j hoạt động](#2-thuật-toán-token-bucket--cách-bucket4j-hoạt-động)
3. [Tổng quan kiến trúc trong dự án](#3-tổng-quan-kiến-trúc-trong-dự-án)
4. [Bước 1: Thêm thư viện Bucket4j vào build.gradle](#bước-1-thêm-thư-viện-bucket4j-vào-buildgradle)
5. [Bước 2: Thêm mã lỗi RATE_LIMIT_EXCEEDED vào ErrorCode.java](#bước-2-thêm-mã-lỗi-rate_limit_exceeded-vào-errorcodejava)
6. [Bước 3: Tạo RateLimitingService.java — Trái tim của hệ thống](#bước-3-tạo-ratelimitingservicejava--trái-tim-của-hệ-thống)
7. [Bước 4: Tích hợp vào AuthController.java — Nơi chặn request](#bước-4-tích-hợp-vào-authcontrollerjava--nơi-chặn-request)
8. [Luồng hoạt động End-to-End](#5-luồng-hoạt-động-end-to-end)
9. [Ví dụ thực tế: Hacker cố tấn công](#6-ví-dụ-thực-tế-hacker-cố-tấn-công)
10. [Tóm tắt toàn bộ file đã thay đổi](#7-tóm-tắt-toàn-bộ-file-đã-thay-đổi)

---

## 1. Rate Limiting là gì? Tại sao cần?

### Định nghĩa
**Rate Limiting** = Giới hạn số lần một người dùng (hoặc IP) được phép gọi API trong một khoảng thời gian nhất định.

### Ví dụ dễ hiểu
Hãy tưởng tượng bạn đi ăn buffet. Nhà hàng quy định: **"Mỗi người chỉ được lấy đồ ăn tối đa 3 lần trong 10 phút"**. Nếu bạn đi lần thứ 4 trong 10 phút đó → nhân viên sẽ chặn lại và bảo: "Xin chờ thêm vài phút".

Rate Limiting cho API cũng y hệt như vậy.

### Tại sao PHẢI có Rate Limiting?

Nếu **KHÔNG** có rate limiting, các API xác thực sẽ bị khai thác:

| Kịch bản tấn công | Không có Rate Limit | Có Rate Limit |
|---|---|---|
| **Brute-force login** — Hacker thử hàng nghìn mật khẩu tự động | ❌ Thử vô hạn cho đến khi đoán đúng mật khẩu | ✅ Bị chặn sau 10 lần/phút |
| **Spam OTP email** — Kẻ xấu gửi hàng nghìn email OTP qua API `/forgot-password` | ❌ Server gửi hàng nghìn email → tốn tiền, có thể bị Gmail ban | ✅ Bị chặn sau 3 lần/phút |
| **DDoS đăng ký** — Bot tạo hàng triệu tài khoản rác | ❌ DB bị đầy tài khoản rác | ✅ Bị chặn sau 10 lần/phút/email |

---

## 2. Thuật toán Token Bucket — Cách Bucket4j hoạt động

Bucket4j sử dụng thuật toán **Token Bucket** (Xô chứa token). Đây là thuật toán phổ biến nhất cho rate limiting.

### Hình dung bằng ví dụ

Tưởng tượng bạn có một **cái xô (bucket)** chứa **xu (token)**:

```
  ┌─────────────────────────┐
  │    🪣 XÔ (Bucket)       │
  │                         │
  │   🪙 🪙 🪙              │  ← Ban đầu có 3 xu (capacity = 3)
  │                         │
  └─────────────────────────┘
          ⬆️
     Mỗi phút nạp lại 3 xu   ← Refill: 3 tokens / 1 phút
```

**Quy tắc:**
1. Mỗi lần gọi API = **lấy ra 1 xu** khỏi xô.
2. Nếu xô **còn xu** → ✅ cho phép request.
3. Nếu xô **hết xu** → ❌ từ chối request (HTTP 429).
4. Hệ thống tự động **nạp lại xu** theo tốc độ cấu hình (ví dụ: 3 xu mỗi phút).

### Minh họa theo thời gian

```
Thời điểm   Xu còn    Hành động           Kết quả
──────────────────────────────────────────────────────
00:00       3/3       Gửi OTP lần 1       ✅ OK (còn 2 xu)
00:05       2/3       Gửi OTP lần 2       ✅ OK (còn 1 xu)
00:10       1/3       Gửi OTP lần 3       ✅ OK (còn 0 xu)
00:15       0/3       Gửi OTP lần 4       ❌ BỊ CHẶN! (hết xu)
00:20       0/3       Gửi OTP lần 5       ❌ BỊ CHẶN!
01:00       3/3       ← Hệ thống nạp lại 3 xu (greedy refill)
01:01       3/3       Gửi OTP lần 6       ✅ OK (xu đã được nạp lại)
```

### Greedy Refill là gì?

`Refill.greedy(3, Duration.ofMinutes(1))` nghĩa là: **nạp đều 3 xu trong 1 phút**.

- Không phải đợi đúng 1 phút rồi nạp 1 lần 3 xu.
- Mà nạp **dần dần**: khoảng mỗi 20 giây nạp 1 xu (3 xu / 60 giây ≈ 1 xu mỗi 20 giây).
- Điều này giúp phân phối đều hơn, người dùng không phải đợi cả phút.

---

## 3. Tổng quan kiến trúc trong dự án

Toàn bộ Rate Limiting nằm ở **phía Backend** (Spring Boot). Frontend không cần biết gì về rate limiting — nó chỉ nhận lỗi 429 và hiển thị thông báo.

### Sơ đồ luồng

```
Frontend (Next.js)                          Backend (Spring Boot)
━━━━━━━━━━━━━━━━━                           ━━━━━━━━━━━━━━━━━━━━

User click "Đăng nhập"                      
       │                                    
       ▼                                    
 POST /api/auth/login ──────────────────▶  AuthController.login()
                                                   │
                                                   ▼
                                           rateLimitingService
                                           .tryConsumeAuth(email)
                                                   │
                                          ┌────────┴────────┐
                                          │                 │
                                       Còn xu?          Hết xu?
                                          │                 │
                                          ▼                 ▼
                                    Cho đi tiếp       throw AppException
                                    vào UserService    (429 RATE_LIMIT_EXCEEDED)
                                          │                 │
                                          ▼                 ▼
                                    Trả LoginResponse    Frontend nhận lỗi
                                    về Frontend          hiện "Quá nhiều lần..."
```

### Các file liên quan (theo thứ tự code)

| # | File | Vai trò |
|---|------|---------|
| 1 | `build.gradle` | Khai báo thư viện Bucket4j |
| 2 | `ErrorCode.java` | Thêm mã lỗi `RATE_LIMIT_EXCEEDED` (HTTP 429) |
| 3 | `RateLimitingService.java` | **Service chính** — quản lý bucket cho từng email |
| 4 | `AuthController.java` | **Nơi gọi** — kiểm tra rate limit trước khi xử lý request |

---

## Bước 1: Thêm thư viện Bucket4j vào `build.gradle`

📄 **File:** [`build.gradle`](file:///d:/Web%20Order_Food/backend_Order/build.gradle) — dòng 51-52

```gradle
// Rate limiting for brute force protection
implementation 'com.github.vladimir-bukhtoyarov:bucket4j-core:7.6.0'
```

### Giải thích
- **Bucket4j** là thư viện Java chuyên dụng cho rate limiting.
- `bucket4j-core` là module lõi, không cần Redis hay cơ sở dữ liệu — chỉ dùng bộ nhớ trong (in-memory).
- Phù hợp cho ứng dụng chạy trên 1 server. Nếu sau này scale nhiều server thì cần thêm `bucket4j-redis` hoặc `bucket4j-hazelcast`.

**Đây là bước đầu tiên — không có dependency này thì không thể import được các class của Bucket4j.**

---

## Bước 2: Thêm mã lỗi `RATE_LIMIT_EXCEEDED` vào `ErrorCode.java`

📄 **File:** [`ErrorCode.java`](file:///d:/Web%20Order_Food/backend_Order/src/main/java/com/example/backend_Ecom/exception/ErrorCode.java) — dòng 33-34

```java
// Rate Limiting (429)
RATE_LIMIT_EXCEEDED(429, "RATE_LIMIT_EXCEEDED", "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút."),
```

### Giải thích
- **HTTP 429 (Too Many Requests)** là mã HTTP chuẩn quốc tế dành riêng cho rate limiting.
- Khi client nhận mã 429, nó biết rằng: "Tôi đã gửi quá nhiều request, cần chờ một chút."
- Thêm vào `ErrorCode` enum để hệ thống `GlobalExceptionHandler` tự động trả JSON lỗi đúng format cho frontend.

### Response khi bị rate limit sẽ trông như thế nào?

```json
{
  "status": 429,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 1 phút."
}
```

---

## Bước 3: Tạo `RateLimitingService.java` — Trái tim của hệ thống

📄 **File:** [`RateLimitingService.java`](file:///d:/Web%20Order_Food/backend_Order/src/main/java/com/example/backend_Ecom/service/RateLimitingService.java)

Đây là file **mới hoàn toàn**, code từ đầu. Giải thích từng dòng:

```java
@Service
public class RateLimitingService {

    // ① Hai bản đồ (Map) lưu bucket cho từng email
    private final Map<String, Bucket> otpBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
```

### ① Tại sao dùng 2 Map riêng biệt?

Vì **OTP** và **Login** có ngưỡng giới hạn khác nhau:
- **OTP** (gửi mail): Giới hạn **3 lần/phút** — vì mỗi lần gửi OTP tốn tiền email.
- **Login/Register**: Giới hạn **10 lần/phút** — cho phép nhiều hơn vì user có thể gõ sai password.

**`ConcurrentHashMap`** được dùng thay vì `HashMap` vì:
- Nhiều request có thể đến cùng lúc (concurrent).
- `HashMap` không an toàn khi nhiều thread truy cập đồng thời → có thể bị lỗi dữ liệu.
- `ConcurrentHashMap` được thiết kế để xử lý an toàn trong môi trường đa luồng.

**Key của Map là gì?** Là **email** của người dùng. Nghĩa là mỗi email có **bucket riêng**. Ví dụ:
```
otpBuckets = {
    "user1@gmail.com" → Bucket(còn 2 xu),
    "user2@gmail.com" → Bucket(còn 3 xu),
    "hacker@evil.com" → Bucket(còn 0 xu)  ← bị chặn!
}
```

---

### ② Method `tryConsumeOtp` — Kiểm tra giới hạn OTP

```java
    public boolean tryConsumeOtp(String key) {
        Bucket bucket = otpBuckets.computeIfAbsent(key, k -> createOtpBucket());
        return bucket.tryConsume(1);
    }
```

**Giải thích từng dòng:**

1. **`computeIfAbsent(key, k -> createOtpBucket())`**
   - Kiểm tra xem email này đã có bucket trong Map chưa?
   - **Nếu chưa có** → tạo bucket mới bằng `createOtpBucket()` và lưu vào Map.
   - **Nếu đã có** → lấy bucket cũ ra (xu có thể đã bị tiêu bớt).
   - Giống như: "Khách hàng `user1@gmail.com` đến → kiểm tra anh ta đã có thẻ buffet chưa? Chưa thì phát thẻ mới."

2. **`bucket.tryConsume(1)`**
   - Thử lấy 1 xu ra khỏi bucket.
   - **Trả về `true`** nếu còn xu → request được chấp nhận.
   - **Trả về `false`** nếu hết xu → request bị từ chối.
   - Phương thức này **thread-safe** (an toàn đa luồng), không cần `synchronized`.

---

### ③ Method `tryConsumeAuth` — Kiểm tra giới hạn đăng nhập

```java
    public boolean tryConsumeAuth(String key) {
        Bucket bucket = authBuckets.computeIfAbsent(key, k -> createAuthBucket());
        return bucket.tryConsume(1);
    }
```

Logic giống hệt `tryConsumeOtp`, nhưng dùng **Map khác** (`authBuckets`) với **ngưỡng khác** (10 lần/phút thay vì 3 lần/phút).

---

### ④ Tạo Bucket — Cấu hình giới hạn

```java
    private Bucket createOtpBucket() {
        Refill refill = Refill.greedy(3, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(3, refill);
        return Bucket.builder().addLimit(limit).build();
    }
```

**Giải thích từng dòng:**

1. **`Refill.greedy(3, Duration.ofMinutes(1))`**
   - Tốc độ nạp lại: **3 xu mỗi 1 phút**.
   - `greedy` = nạp dần đều (không đợi hết 1 phút rồi nạp cả 3 xu cùng lúc).

2. **`Bandwidth.classic(3, refill)`**
   - Dung lượng tối đa của xô: **3 xu**.
   - Không bao giờ có quá 3 xu trong xô, dù đã chờ rất lâu.

3. **`Bucket.builder().addLimit(limit).build()`**
   - Tạo 1 Bucket hoàn chỉnh với cấu hình trên.

**Bucket cho Auth tương tự nhưng ngưỡng cao hơn:**

```java
    private Bucket createAuthBucket() {
        Refill refill = Refill.greedy(10, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(10, refill);
        return Bucket.builder().addLimit(limit).build();
    }
```

→ **10 xu mỗi phút**, dung lượng tối đa **10 xu**.

---

## Bước 4: Tích hợp vào `AuthController.java` — Nơi chặn request

📄 **File:** [`AuthController.java`](file:///d:/Web%20Order_Food/backend_Order/src/main/java/com/example/backend_Ecom/controller/AuthController.java)

### Thay đổi 1: Inject `RateLimitingService`

```java
public class AuthController {

    private final UserService userService;
    private final RateLimitingService rateLimitingService;  // ← THÊM MỚI
```

Nhờ `@RequiredArgsConstructor` (Lombok), Spring Boot tự động inject service qua constructor.

### Thay đổi 2: Kiểm tra rate limit TRƯỚC KHI xử lý business logic

**Endpoint `/login` — trước khi sửa:**
```java
@PostMapping("/login")
public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
    LoginResponseDto result = this.userService.login(request);
    return ResponseEntity.ok(result);
}
```

**Endpoint `/login` — sau khi thêm rate limit:**
```java
@PostMapping("/login")
public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
    // ⬇️ KIỂM TRA RATE LIMIT TRƯỚC
    if (!rateLimitingService.tryConsumeAuth(request.getEmail())) {
        throw new AppException(ErrorCode.RATE_LIMIT_EXCEEDED,
            "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 1 phút.");
    }
    // ⬇️ CHỈ KHI QUA ĐƯỢC RATE LIMIT MỚI XỬ LÝ TIẾP
    LoginResponseDto result = this.userService.login(request);
    return ResponseEntity.ok(result);
}
```

### Tại sao đặt rate limit ở Controller mà không phải ở Service?

```
Controller (chặn sớm nhất) ← Rate limit ở đây ✅
    │
    ▼
Service (business logic)   ← Nếu đặt ở đây thì đã tốn chi phí validate, query DB... ❌
    │
    ▼
Repository (truy vấn DB)
```

**Lý do:** Rate limit phải chặn **sớm nhất có thể** — trước khi tốn bất kỳ tài nguyên nào (DB query, bcrypt hash, gửi email). Nếu đặt ở Service, request vẫn phải đi qua validation, mở transaction rồi mới bị chặn → lãng phí.

### Các endpoint đã được bảo vệ

| Endpoint | Loại Rate Limit | Giới hạn |
|----------|----------------|----------|
| `POST /api/auth/login` | Auth | 10 lần/phút/email |
| `POST /api/auth/register` | Auth | 10 lần/phút/email |
| `POST /api/auth/forgot-password` | OTP | 3 lần/phút/email |
| `POST /api/auth/change-password/send-otp` | OTP | 3 lần/phút/email |
| `POST /api/auth/refresh-token` | ❌ Không cần | Đã có JWT validation |
| `POST /api/auth/reset-password` | ❌ Không cần | Đã có OTP verification |
| `PATCH /api/auth/change-password` | ❌ Không cần | Đã có OTP + Auth |

---

## 5. Luồng hoạt động End-to-End

### Kịch bản: User quên mật khẩu và yêu cầu gửi OTP

```
[1] User nhập email "user@gmail.com" → click "Gửi mã OTP"

[2] Frontend gọi: POST /api/auth/forgot-password
    Body: { "email": "user@gmail.com" }

[3] Backend AuthController.forgotPassword() nhận request
    │
    ├─ [4] Gọi rateLimitingService.tryConsumeOtp("user@gmail.com")
    │      │
    │      ├─ Kiểm tra otpBuckets.get("user@gmail.com")
    │      │   → Chưa có → Tạo mới bucket (3 xu)
    │      │
    │      ├─ bucket.tryConsume(1)
    │      │   → Còn 3 xu → lấy 1 → còn 2 → return TRUE ✅
    │      │
    │      └─ Kết quả: TRUE → cho đi tiếp
    │
    ├─ [5] Gọi userService.forgotPassword(request)
    │      → Tạo OTP, hash lưu DB, gửi email
    │
    └─ [6] Trả về: 200 OK
           { "success": true, "message": "Password reset OTP has been sent to your email" }

[7] User nhấn "Gửi lại mã" thêm 2 lần nữa → vẫn OK (còn 2 xu, rồi 1 xu)

[8] User nhấn "Gửi lại mã" lần thứ 4 trong cùng 1 phút
    │
    ├─ rateLimitingService.tryConsumeOtp("user@gmail.com")
    │   → Bucket còn 0 xu → return FALSE ❌
    │
    └─ throw AppException(RATE_LIMIT_EXCEEDED)
       → Response: 429 Too Many Requests
       { "status": 429, "code": "RATE_LIMIT_EXCEEDED",
         "message": "Quá nhiều yêu cầu gửi OTP. Vui lòng thử lại sau 1 phút." }

[9] Sau ~20 giây: Bucket tự nạp 1 xu (greedy refill)
    → User có thể gửi thêm 1 request OTP
```

---

## 6. Ví dụ thực tế: Hacker cố tấn công

### Kịch bản 1: Brute-force mật khẩu

```
Hacker viết script tự động:
  for password in ["123456", "password", "admin", ...]:
      POST /api/auth/login { email: "victim@gmail.com", password: password }

Lần 1:  ✅ 401 Invalid credentials  (còn 9 xu)
Lần 2:  ✅ 401 Invalid credentials  (còn 8 xu)
...
Lần 10: ✅ 401 Invalid credentials  (còn 0 xu)
Lần 11: ❌ 429 RATE_LIMIT_EXCEEDED  ← BỊ CHẶN
Lần 12: ❌ 429 RATE_LIMIT_EXCEEDED  ← BỊ CHẶN
...

→ Hacker chỉ thử được tối đa 10 mật khẩu/phút.
→ Thay vì thử 100.000 mật khẩu/phút nếu không có rate limit.
→ Kết hợp với Account Lockout (5 lần sai → khóa 15 phút), hacker gần như không thể phá được.
```

### Kịch bản 2: Spam OTP tốn tiền email

```
Kẻ xấu gọi liên tục:
  POST /api/auth/forgot-password { email: "random@email.com" }

Lần 1: ✅ Gửi email thành công  (còn 2 xu)
Lần 2: ✅ Gửi email thành công  (còn 1 xu)
Lần 3: ✅ Gửi email thành công  (còn 0 xu)
Lần 4: ❌ 429 BỊ CHẶN — KHÔNG gửi email
Lần 5: ❌ 429 BỊ CHẶN — KHÔNG gửi email

→ Tối đa 3 email/phút/địa chỉ.
→ Server không bị tốn tài nguyên gửi mail vô ích.
```

---

## 7. Tóm tắt toàn bộ file đã thay đổi

| # | File | Loại thay đổi | Chi tiết |
|---|------|---------------|----------|
| 1 | `build.gradle` (dòng 51-52) | Đã có sẵn | Dependency `bucket4j-core:7.6.0` đã được khai báo từ trước |
| 2 | `ErrorCode.java` (dòng 33-34) | **Thêm mới** | Thêm enum `RATE_LIMIT_EXCEEDED(429, ...)` |
| 3 | `RateLimitingService.java` | **File mới hoàn toàn** | 46 dòng — Service quản lý Token Bucket |
| 4 | `AuthController.java` | **Sửa đổi** | Inject `RateLimitingService` + thêm kiểm tra `if (!rateLimitingService.tryConsume...)` ở 4 endpoint |

### Tổng code thêm/sửa: ~60 dòng

Rate limiting chỉ cần **~60 dòng code** nhưng bảo vệ toàn bộ hệ thống xác thực khỏi các cuộc tấn công phổ biến nhất.

---

## 📝 GHI CHÚ BỔ SUNG

### Hạn chế hiện tại
- Rate limit lưu trong **bộ nhớ (in-memory)**. Nếu restart server → tất cả bucket bị reset.
- Nếu chạy **nhiều instance** (scale horizontally) → mỗi instance có bộ nhớ riêng → hacker có thể gửi request đến nhiều instance khác nhau để bypass. Giải pháp: dùng **Redis** làm shared storage cho Bucket4j.

### Mở rộng sau này
- Thêm rate limit theo **IP address** (dùng `HttpServletRequest.getRemoteAddr()`).
- Dùng **Bucket4j + Redis** cho môi trường production multi-instance.
- Thêm header `Retry-After` trong response 429 để client biết nên chờ bao lâu.
