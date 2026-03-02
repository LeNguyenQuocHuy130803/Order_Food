# 📚 Giải Thích Chi Tiết 3 File API Client Mới

## 🎯 Vấn Đề Ban Đầu
Khi nhập sai thông tin và bấm nút submit trên form login/register, toàn bộ dữ liệu đã nhập sẽ bị xóa hết, phải nhập lại từ đầu. 

**Nguyên nhân**: Khi request bị reject do validation error, form state bị reset không cần thiết.

**Giải pháp**: Sử dụng **Axios** thay vì Fetch API với **interceptor xử lý error thông minh** - giữ nguyên form data khi có lỗi, chỉ hiển thị error message.

---

## 📁 Ba File Code Mới

### 1️⃣ **api-client-advanced.ts** (Khuyên dùng - Sản xuất)

**Mục đích**: API client với tính năng nâng cao
- ✅ Quản lý token tự động (attach token vào mỗi request)
- ✅ Token refresh tự động khi hết hạn
- ✅ Xử lý hàng đợi request khi đang refresh token (tránh race condition)
- ✅ Giữ nguyên dữ liệu form khi có lỗi validation
- ✅ Xử lý 401/403 error thông minh

**Cách hoạt động**:

```typescript
// REQUEST INTERCEPTOR
- Lấy access token từ localStorage
- Tự động gắn vào Authorization header: "Bearer <token>"
- Nếu skipAuth = true, bỏ qua token (cho login/register endpoint)

// RESPONSE INTERCEPTOR (Xử lý error)
1. Kiểm tra lỗi

2. Nếu là login request (POST /auth/login):
   → Reject error, form data được giữ lại
   → Hiển thị error message

3. Nếu là 401/403 error (token hết hạn):
   → Gọi refreshToken() để lấy token mới
   
4. Nếu refresh token thành công:
   → Cập nhật token mới
   → Retry request cũ với token mới
   
5. Nếu refresh token thất bại:
   → Clear localStorage
   → Redirect đến /login-page
```

**Công dụng của từng phần**:

- **processQueue()**: Xử lý các request đang chờ token mới
  - Nếu refresh thành công → resolve với token mới → retry request
  - Nếu refresh thất bại → reject → user phải login lại

- **isRefreshing flag**: Tránh gọi refresh token nhiều lần cùng lúc
  - Lần 1: Thực thi refresh
  - Lần 2, 3, ... : Thêm vào hàng đợi chờ kết quả

- **originalRequest._retry**: Tránh retry vô hạn
  - Chỉ retry 1 lần duy nhất

---

### 2️⃣ **api-client-simple.ts** (Phát triển - Đơn giản)

**Mục đích**: API client cơ bản, không có token refresh

**Cách hoạt động**:

```typescript
// REQUEST INTERCEPTOR
- Lấy access token từ localStorage
- Tự động gắn vào Authorization header
- Nếu skipAuth = true, bỏ qua token

// RESPONSE INTERCEPTOR (Đơn giản)
1. Kiểm tra lỗi

2. Nếu là login/register request:
   → Reject error, form data được giữ lại ✅
   
3. Nếu là 401/403 error:
   → Clear localStorage
   → Redirect đến /login-page
   
4. Lỗi khác:
   → Reject error
```

**Khác với advanced**:
- ❌ Không có token refresh
- ❌ Không xử lý hàng đợi request
- ✅ Đơn giản, nhanh, cho development

---

### 3️⃣ **index.ts** (Selector)

**Mục đích**: Chọn giữa 2 phiên bản

```typescript
const mode: 'simple' | 'advanced' = 'advanced'

const apiClient = mode === 'advanced' ? apiClientAdvanced : apiClientSimple
```

**Cách sử dụng**:
- Để dùng **advanced**: `const mode = 'advanced'`
- Để dùng **simple**: `const mode = 'simple'`
- Các file khác tự động import đúng phiên bản

---

## 🔧 Các Files Đã Được Cập Nhật

### **authService.ts**
```typescript
// CŨ: Sử dụng Fetch API
const response = await apiClient('/auth/login', {
  method: 'POST',
  body: JSON.stringify(...)
})
return response.json()

// MỚI: Sử dụng Axios
const response = await apiClient.post('/auth/login', {...})
return response  // Axios tự động parse JSON
```

### **useRegister.ts**
```typescript
// CŨ: Xử lý Fetch API response
const response = await apiClient('/auth/register', {...})
if (!response.ok) throw new Error(...)
const registerData = await response.json()

// MỚI: Xử lý Axios response
const registerData = await apiClient.post('/auth/register', {...})
// Không cần .ok check, Axios throws error tự động
```

---

## 🌐 Cấu Hình URL

**File**: `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Kết quả**:
- baseURL = http://localhost:8080/api
- endpoint = /auth/login
- **URL gọi** = http://localhost:8080/api/auth/login ✓

💡 Thay đổi `localhost:8080` nếu backend chạy ở port khác

---

## 💾 Flow: Tại Sao Form Data Giữ Lại?

### ❌ **Cũ (Lỗi)**
```
User nhập: username="abc", password="123"
↓
Bấm submit
↓
Form gọi handleLogin()
↓
API return error "Invalid password"
↓
❌ Component re-render, reset form
↓
Input fields trống!
```

### ✅ **Mới (Fix)**
```
User nhập: username="abc", password="123"
↓
Bấm submit
↓
Form gọi handleLogin()
↓
setError(null)  ← Chỉ clear error, không reset form!
↓
API return error "Invalid password"
↓
setError("Invalid password")  ← Gán error message
↓
setLoading(false)
↓
✅ Form data: username="abc", password="123" (GIỮ LẠI!)
✅ Error message hiển thị
↓
User có thể sửa password mà không cần nhập lại username
```

**Key fix**: 
- `clearError()` → chỉ xóa error state
- Không gọi `reset()` form
- form data vẫn lưu trong React Hook Form state

---

## 🚀 So Sánh 2 Phiên Bản

| Feature | Simple | Advanced |
|---------|--------|----------|
| Token tự động gắn | ✅ | ✅ |
| Token refresh | ❌ | ✅ |
| Xử lý hàng đợi | ❌ | ✅ |
| Tránh race condition | ❌ | ✅ |
| Giữ form data khi error | ✅ | ✅ |
| Độ phức tạp | Thấp | Cao |
| Dùng cho | Dev/Testing | Production |

---

## 📝 Các Endpoint Hỗ Trợ

```bash
POST /api/auth/login
  Body: { usernameOrEmail: string, password: string }
  Response: { accessToken, id, username, roles }

POST /api/auth/register  
  Body: { email, userName, password, phoneNumber }
  Response: { accessToken, id, username, roles }

POST /api/auth/refresh-token (Advanced only)
  Body: { refreshToken: string }
  Response: { accessToken, refreshToken }
```

---

## 🔐 LocalStorage Keys

```javascript
localStorage.setItem('accessToken', token)      // JWT token
localStorage.setItem('userId', id)              // User ID
localStorage.setItem('username', name)          // Username
localStorage.setItem('roles', JSON.stringify([])) // User roles
```

---

## ⚠️ Lưu Ý

1. **skipAuth option**: Dùng cho login/register (chưa có token)
   ```typescript
   apiClient.post('/auth/login', data, { skipAuth: true })
   ```

2. **Error handling**: Axios throws error, không return response.ok
   ```typescript
   try {
     const data = await apiClient.post(...)
   } catch (error) {
     const message = error.response?.data?.message
   }
   ```

3. **CORS**: Nếu backend ở domain khác, cần enable CORS trên Spring Boot

4. **Token expiry**: Advanced mode tự động refresh, Simple mode không
