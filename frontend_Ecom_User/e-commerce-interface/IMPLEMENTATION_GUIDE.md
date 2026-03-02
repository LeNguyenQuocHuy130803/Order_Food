# 🎯 Hướng Dẫn Hoàn Chỉnh - Sửa Lỗi Form Reset

## 📝 Tóm Tắt Công Việc Đã Hoàn Thành

✅ **Tạo 3 file API client mới**
- `lib/api/api-client-advanced.ts` - Advanced (khuyên dùng production)
- `lib/api/api-client-simple.ts` - Simple (development)
- `lib/api/index.ts` - Selector giữa 2 phiên bản

✅ **Cập nhật 3 file app logic**
- `service/authService.ts` - LoginUser method
- `hooks/useRegister.ts` - Register hook
- `lib/api/apiClient.ts` - Backward compatibility wrapper

✅ **Cài đặt dependencies**
- axios (HTTP client library)

✅ **Tạo file cấu hình**
- `.env.local` - Đã có sẵn với URL `http://localhost:8080/api`

✅ **Tạo tài liệu**
- `API_CLIENT_EXPLANATION.md` - Giải thích chi tiết (200+ dòng)
- `QUICK_SUMMARY.md` - Tóm tắt nhanh
- `IMPLEMENTATION_GUIDE.md` - File này (hướng dẫn hoàn chỉnh)

---

## 🔥 Vấn Đề Ban Đầu & Cách Sửa

### ❌ Trước: Fetch API (Lỗi Form Reset)
```
User nhập dữ liệu → Bấm submit → API error (validation) → Form reset trống
```

**Cách xảy ra**:
1. User nhập email, password vào form
2. Form submit → gọi handleLogin()
3. API trả về error (invalid password)
4. handleLogin catch error → setError() 
5. ❌ Component re-render → form reset ← **BUG!**
6. Input fields trống, user phải nhập lại

### ✅ Sau: Axios + Smart Error Handling
```
User nhập dữ liệu → Bấm submit → API error (validation) → Form data GIỮA LẠI
```

**Cách hoạt động**:
1. User nhập email, password vào form
2. Form submit → gọi handleLogin()
3. setError(null) → **chỉ clear error, không reset form!**
4. API trả về error 
5. handleLogin catch error → setError(errorMessage)
6. ✅ Component re-render → form data GIỮ LẠI ← **FIX!**
7. Error message hiển thị, user chỉ sửa 1 field

---

## 📊 So Sánh Code

### **Trước: Fetch API**
```typescript
// authService.ts
const response = await apiClient('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
  skipAuth: true
})

if (!response.ok) {
  throw new Error(...)
}

return response.json()
```

### **Sau: Axios**
```typescript
// authService.ts
try {
  const response = await apiClient.post('/auth/login', credentials)
  return response  // Axios automatic JSON parsing
} catch (error) {
  throw new Error(error.response?.data?.message || 'Error')
}
```

**Khác biệt**:
| Fetch API | Axios |
|-----------|-------|
| `fetch()` → Response object | `axios.post()` → Direct data |
| `.ok` check | Throws error automatically |
| `.json()` parse | Data parsed tự động |
| Verbose | Clean & concise |

---

## 🎨 3 File Code - Chi Tiết

### **1. api-client-advanced.ts** (200 dòng, Production-ready)

```typescript
const apiClient = Axios.create({
  baseURL: URL,  // http://localhost:8080/api
  headers: { 'Content-Type': 'application/json' }
})

// REQUEST INTERCEPTOR
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response.data,  // ← Return data trực tiếp
  async (error) => {
    // 1. Nếu là login error → reject, giữ form data
    if (error.config.url === '/auth/login') {
      return Promise.reject(error)
    }
    
    // 2. Nếu là 401 error → refresh token
    if (error.response?.status === 401) {
      // ... refresh token logic ...
    }
    
    return Promise.reject(error)
  }
)
```

**Tính năng:**
- 🔄 Token refresh tự động (khi token hết hạn)
- 🚦 Hàng đợi request (xử lý race condition)
- 📝 Giữ form data khi error
- 🛡️ Smart error handling

---

### **2. api-client-simple.ts** (70 dòng, Development)

```typescript
const apiClient = Axios.create({
  baseURL: URL,
  headers: { 'Content-Type': 'application/json' }
})

// REQUEST INTERCEPTOR - Gắn token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// RESPONSE INTERCEPTOR - Đơn giản
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Nếu login → reject (giữ form data)
    if (error.config.url === '/auth/login') 
      return Promise.reject(error)
    
    // Nếu 401/403 → redirect login
    if (error.response?.status === 401 || 403) {
      localStorage.clear()
      window.location.href = '/login-page'
    }
    
    return Promise.reject(error)
  }
)
```

**Tính năng:**
- ✅ Token gắn tự động
- ✅ Giữ form data khi error
- ❌ Không token refresh
- ✅ Type xơ (development)

---

### **3. index.ts** (Selector)

```typescript
import apiClientSimple from './api-client-simple'
import apiClientAdvanced from './api-client-advanced'

// Chọn mode
const mode: 'simple' | 'advanced' = 'advanced'

const apiClient = mode === 'advanced' 
  ? apiClientAdvanced 
  : apiClientSimple
```

**Cách dùng:**
```typescript
// Trong các file khác
import apiClient from '@/lib/api/index'
// hoặc
import apiClient from '@/lib/api'

// Sử dụng giống Axios
const data = await apiClient.post('/auth/login', credentials)
```

---

## 🔧 Cấu Hình & Dependencies

### **.env.local** (Đã có sẵn)
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

✅ URL đã match với Spring Boot endpoint  
🔧 Nếu backend port khác, sửa đây

### **Dependencies Đã Cài**
```bash
npm install axios          # HTTP client
npm install --save-dev @types/axios  # TypeScript types
```

---

## 📲 Cách Sử Dụng Trong Component

### **Login Component**
```typescript
import { useLogin } from '@/hooks/useLogin'

export default function LoginForm() {
  const { loading, error, success, handleLogin, clearError } = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm()
  
  const onSubmit = (data) => {
    clearError()  // ← Chỉ clear error, không reset form!
    handleLogin(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <div className="text-red-500">{error}</div>}
      {/* Form inputs ... */}
    </form>
  )
}
```

### **Register Component**
```typescript
import { useRegister } from '@/hooks/useRegister'

export default function RegisterForm() {
  const { loading, error, success, handleRegister, clearError } = useRegister()
  const { register, handleSubmit } = useForm()
  
  const onSubmit = (data) => {
    clearError()
    handleRegister(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <div className="text-red-500">{error}</div>}
      {/* Form inputs ... */}
    </form>
  )
}
```

---

## 🧪 Kiểm Tra (Testing)

### **Test Case 1: Form Data Giữ Lại - Login**

```bash
1. Mở http://localhost:3000/login-page
2. Nhập Username: "testuser"
3. Nhập Password: "123456"
4. Bấm "Sign In"
5. Backend trả error: "Invalid password"
6. Kiểm tra:
   ✅ Username field còn "testuser"
   ✅ Password field còn "123456"  
   ✅ Red error message hiển thị
7. User có thể sửa password, không nhập lại username
```

### **Test Case 2: Form Data Giữ Lại - Register**

```bash
1. Mở http://localhost:3000/register-page
2. Nhập:
   - Email: "test@example.com"
   - Username: "testuser"
   - Password: "Test@123"
   - Phone: "123invalid" (sai)
   - Confirm: "Test@123"
3. Bấm "Sign Up"
4. Backend trả error: "Invalid phone number"
5. Kiểm tra:
   ✅ Email field còn "test@example.com"
   ✅ Username field còn "testuser"
   ✅ Password field còn "Test@123"
   ✅ Phone field còn "123invalid"
   ✅ Error message: "Invalid phone number"
6. User chỉ sửa phone field
```

### **Test Case 3: Successful Login**

```bash
1. Mở login page
2. Nhập correct credentials
3. Bấm "Sign In"
4. Kiểm tra:
   ✅ Success message "Login successful! Redirecting..."
   ✅ Sau 1.5s, redirect tới home page (/)
   ✅ accessToken lưu ở localStorage
```

---

## 🔍 Debug Tips

### **Kiểm tra API Requests**
```javascript
// Mở browser DevTools → Network tab
// Xem tất cả requests đến /api/auth/login
// Check response status & data
```

### **Kiểm tra Token**
```javascript
// Mở browser Console → paste:
localStorage.getItem('accessToken')
localStorage.getItem('userId')
localStorage.getItem('username')
localStorage.getItem('roles')
```

### **Kiểm tra Error Messages**
```javascript
// Mở browser Console → xem logs
// api-client-advanced sẽ log: "Failed to refresh token:"
// api-client-simple sẽ log: "Authentication failed"
```

### **Thử Refresh Token** (Advanced Mode)
```javascript
// 1. Login thành công (token saved)
// 2. Tungsamau lâu để token "expire" (giả lập)
// 3. Bấm action nào đó (gọi API)
// 4. api-client-advanced sẽ tự refresh token (background)
// 5. Request sẽ retry với token mới
```

---

## ⚙️ Tuỳ Chỉnh

### **Sửa Mode: Simple → Advanced**
```typescript
// Trong lib/api/index.ts
const mode: 'simple' | 'advanced' = 'advanced'  // ← Thay đổi ở đây
```

### **Sửa Backend URL**
```typescript
// Trong .env.local
NEXT_PUBLIC_API_URL=http://your-backend-url/api
```

### **Sửa Login Redirect Path**
```typescript
// Trong api-client-advanced.ts hoặc api-client-simple.ts
window.location.href = '/login-page'  // ← Thay đổi path ở đây
```

### **Thêm Cache Headers**
```typescript
// Trong api-client-advanced.ts request interceptor
config.headers['Cache-Control'] = 'no-cache'
```

---

## 📚 File Tài Liệu

Bạn có 3 file tài liệu để tham khảo:

1. **QUICK_SUMMARY.md** ← Start here (Tóm tắt nhanh)
2. **API_CLIENT_EXPLANATION.md** ← Chi tiết kỹ thuật
3. **IMPLEMENTATION_GUIDE.md** ← Hướng dẫn hoàn chỉnh (File này)

---

## ✨ Lợi Ích Chính

| Điểm | Trước | Sau |
|------|-------|-----|
| Form data khi error | ❌ Reset | ✅ Giữ lại |
| Token handling | Thủ công | Tự động |
| Error messages | Generic | Chi tiết |
| Code quality | Fetch API | Axios |
| Production ready | ⚠️ Ha hạn | ✅ Ready |

---

## 🎉 Hoàn Thành!

Bây giờ:
1. ✅ Form sẽ GIỮ LẠI dữ liệu khi có lỗi validation
2. ✅ User không cần nhập lại từ đầu
3. ✅ Error messages hiển thị rõ ràng
4. ✅ Token tự động refresh (advanced mode)
5. ✅ Code cleaner & more maintainable

---

## 🆘 Troubleshooting

### **Lỗi: "Cannot find module 'axios'"**
```bash
npm install axios
npm install --save-dev @types/axios
```

### **Lỗi: "NEXT_PUBLIC_API_URL is undefined"**
- Kiểm tra file `.env.local`
- Nó phải có: `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
- Next.js restart dev server: `npm run dev`

### **Lỗi: "Cannot POST /api/auth/login"**
- Backend không chạy
- Chạy Spring Boot: `java -jar backend.jar`
- Hoặc IDE run button

### **Form field không giữ value**
- Kiểm tra `useForm()` setup
- Đảm bảo `...register('fieldName')` gắn vào input
- Không gọi `reset()` khi error

---

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra `QUICK_SUMMARY.md` - Lỗi thường gặp
2. Đọc `API_CLIENT_EXPLANATION.md` - Giải thích chi tiết
3. Xem browser DevTools → Network/Console tabs
4. Kiểm tra `.env.local` URL

---

**Bây giờ bạn đã sẵn sàng! Happy Coding! 🚀**
