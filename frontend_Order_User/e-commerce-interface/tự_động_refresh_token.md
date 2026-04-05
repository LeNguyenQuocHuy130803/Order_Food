# 🔄 Tự Động Refresh Token - Auto-Refresh Interceptor

## 📋 Tổng Quan

Hệ thống tự động refresh token được xây dựng dựa trên **Axios Response Interceptor** để tự động xử lý lỗi `401 (Unauthorized)` khi token hết hạn. Thay vì hiển thị lỗi cho user, hệ thống sẽ:

1. **Phát hiện** token hết hạn (401 response)
2. **Gọi API refresh** để lấy token mới
3. **Thử lại request** cũ với token mới
4. **Quản lý hàng đợi** để tránh race condition khi nhiều request fail cùng lúc

---

## 🏗️ Kiến Trúc

### 1. **Centralized API Client** (`lib/apiClient.ts`)

```typescript
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // 🔒 Tự động gửi cookies (access token + refresh token)
})
```

**Vai trò:**
- ✅ Tạo axios instance với base URL backend
- ✅ Tự động thêm HTTP-only cookies vào mỗi request
- ✅ Cấu hình response interceptor để xử lý 401
- ✅ Quản lý queue để prevent race condition

### 2. **Response Interceptor** - Xử Lý 401

```typescript
apiClient.interceptors.response.use(
  (response) => response,  // ✅ Success → return như bình thường
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 🔄 Token hết hạn → refresh ngay
      return handleTokenRefresh(originalRequest)
    }
    return Promise.reject(error)
  }
)
```

**Luồng xử lý:**

```
Request gửi đi
    ↓
Backend return 401 (token expired)
    ↓
Interceptor catch lỗi
    ↓
Cần refresh token?
    ├─ Có + Đang refresh? → Thêm vào queue, đợi
    └─ Có + Chưa refresh? → Gọi refresh endpoint
        ↓
    Gọi POST /api/auth/refresh
        ↓
    Refresh thành công? 
        ├─ Có → Retry request cũ + Process queue
        └─ Không → Redirect /login-page
```

---

## 🔗 Luồng Chi Tiết

### **Bước 1: Gửi Request (Normal)**

```typescript
// service/userService.ts
const userDetail = await userService.getUserById(user.id)
// Thực tế gọi:
// apiClient.get('/users/{id}')
```

**Điều gì xảy ra:**
- apiClient gửi GET request kèm cookies (access token trong HTTP-only cookie)
- Backend verify token + return data (hoặc 401 nếu token hết hạn)

### **Bước 2: Token Hết Hạn → 401 Response**

```
Backend response:
{
  status: 401,
  statusText: 'Unauthorized',
  data: { message: 'Token expired' }
}
```

**Interceptor bắt được:**
```typescript
error.response?.status === 401  // ✅ Đúng là 401
originalRequest._retry  // ❌ Chưa retry lần nào, còn undefined
```

### **Bước 3: Gọi Refresh Endpoint**

```typescript
// Gọi frontend route handler
await axios.post(
  '/api/auth/refresh',
  {},
  { withCredentials: true }
)
```

**`/api/auth/refresh` (route handler) làm gì:**
```typescript
// app/api/auth/refresh/route.ts
1. Đọc refreshToken từ HTTP-only cookie
   const refreshToken = req.cookies.get('refreshToken')?.value

2. Gọi backend endpoint
   POST http://localhost:8080/api/auth/refresh-token
   Body: { refreshToken }

3. Backend trả về:
   {
     accessToken: "new_jwt_token...",
     refreshToken: "new_refresh_token..."
   }

4. Set vào HTTP-only cookies mới
   res.cookies.set('accessToken', newToken, {
     httpOnly: true,
     secure: false,  // 🔧 DEV: localhost HTTP
     sameSite: 'lax',
     maxAge: 3600,   // 1 giờ
   })
```

### **Bước 4: Retry Request Cũ**

```typescript
// Sau khi refresh thành công
return apiClient(originalRequest)
```

**Điều gì xảy ra:**
- Request ban đầu được gửi lại **với token mới**
- HTTP-only cookie đã updated → request tự động có token mới
- Backend verify + return data ✅

### **Bước 5: Queue System (Khi Nhiều Request Failed Cùng Lúc)**

```
Request 1: GET /users/1  →  401
Request 2: GET /foods/1  →  401
Request 3: POST /orders  →  401

Cùng lúc nhận 401:

Request 1 → isRefreshing = false → Bắt đầu refresh
           isRefreshing = true

Request 2 → isRefreshing = true → Thêm vào failedQueue
           (đợi không gọi refresh lần 2)

Request 3 → isRefreshing = true → Thêm vào failedQueue
           (đợi không gọi refresh lần 3)

Refresh hoàn tất → isRefreshing = false
  ↓
Retry Request 1, 2, 3 (tất cả cùng lúc với token mới)
```

**Tại sao cần queue?**
- Nếu không có queue → 3 request → 3 refresh call → Race condition 🔴
- Có queue → 3 request → 1 refresh call → 3 requests retry ✅ (Optimal)

---

## 📁 File Liên Quan

### **1. `lib/apiClient.ts`** - Axios Instance + Interceptor
```typescript
// ✅ Tạo axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true
})

// ✅ Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Xử lý 401 + refresh token
  }
)

export default apiClient
```

**Vai trò chính:**
- Centralized API client được dùng bởi tất cả services
- Tự động thêm cookies vào mỗi request
- Tự động xử lý 401 + retry

### **2. `app/api/auth/refresh/route.ts`** - Frontend Refresh Handler
```typescript
export async function POST(req: NextRequest) {
  // 1. Đọc refreshToken từ cookie
  const refreshToken = req.cookies.get('refreshToken')?.value
  
  // 2. Gọi backend
  const backendRes = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  })
  
  // 3. Set cookies mới
  res.cookies.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: false,  // 🔧 DEV environment
    sameSite: 'lax',
    maxAge: 3600
  })
  
  return res
}
```

**Vai trò chính:**
- Trung gian giữa Frontend + Backend
- Xử lý cookie: đọc từ frontend, set mới vào frontend
- Gọi backend endpoint để refresh

### **3. `service/userService.ts`** - Sử Dụng apiClient
```typescript
import apiClient from '@/lib/apiClient'

export const userService = {
  async getUserById(userId: number): Promise<UserDetail> {
    // Gọi qua apiClient → tự động có interceptor
    const { data } = await apiClient.get<UserDetail>(`/users/${userId}`)
    return data
  }
}
```

**Vai trò chính:**
- Gọi backend API qua `apiClient`
- Tự động được wrapped bởi refresh interceptor
- Không cần xử lý 401 thủ công

### **4. `app/account/page.tsx`** - Sử Dụng userService
```typescript
useEffect(() => {
  const fetchUserDetail = async () => {
    try {
      // Gọi userService → qua apiClient → interceptor
      const userDetail = await userService.getUserById(user.id)
      setProfile(userDetail)
    } catch (err) {
      setError(err.message)
    }
  }
  fetchUserDetail()
}, [user, loading])
```

**Vai trò chính:**
- Gọi userService để fetch user detail
- Nếu token expire → interceptor tự động refresh + retry
- User không thấy lỗi 401 (hoặc chỉ thấy loading rất ngắn)

---

## 🔐 Security Considerations

### **HTTP-Only Cookies** 🔒
```typescript
// Tokens được lưu trong HTTP-Only cookies
res.cookies.set('accessToken', token, {
  httpOnly: true,    // ✅ JavaScript không thể access (XSS safe)
  secure: false,     // 🔧 DEV: HTTP localhost
  sameSite: 'lax',   // ✅ CSRF protection
  path: '/'
})
```

**Lợi ích:**
- ✅ XSS safe - JavaScript không thể steal token
- ✅ Tự động gửi trong cookies (request của browser)
- ✅ CSRF protected - sameSite=lax

### **Token Refresh Flow** 🔄
```
❌ Không làm: Lưu token ở localStorage → XSS có thể steal
✅ Làm đúng: Lưu token ở HTTP-only cookies → JavaScript không access được
```

### **Production Setup** 🚀
```typescript
// Production (HTTPS)
secure: process.env.NODE_ENV === 'production'

// Development (HTTP)
secure: false

// Best practice: Hardcode false, apply environment check elsewhere
secure: false  // Dev environment, HTTPS enforced by infrastructure in prod
```

---

## 🧪 Testing Token Refresh

### **Scenario 1: Token Hết Hạn Khi Fetch User Detail**

```typescript
// Giả sử token hết hạn sau khi đặt lịch 1 giờ

// User vào trang Account
// → GET /users/{id}
// → Backend kiểm tra token → ❌ 401 (hết hạn)
// → Interceptor catch 401
// → POST /api/auth/refresh → Backend return token mới
// → GET /users/{id} retry → ✅ 200 OK (với token mới)
// → Hiển thị user detail ✅
```

### **Scenario 2: Nhiều Request Fail Cùng Lúc**

```typescript
// User load dashboard (gọi 3 API cùng lúc)
// GET /users/{id} → 401
// GET /foods → 401
// GET /orders → 401

// Interceptor xử lý:
// [Request 1] Start refresh
// [Request 2] Join queue (đợi)
// [Request 3] Join queue (đợi)
// Refresh success
// [Request 1, 2, 3] Retry cùng lúc ✅
```

### **Scenario 3: Refresh Token Cũng Hết Hạn**

```typescript
// Backend response: 401 (both access + refresh token expired)
// → Catch error
// → Redirect /login-page
// → User phải login lại
```

---

## 💡 Cách Sử Dụng

### **Trong Services:**
```typescript
// ✅ Đúng cách - Dùng apiClient
import apiClient from '@/lib/apiClient'

const data = await apiClient.get('/users/1')  // Có interceptor
```

### **Trong Components:**
```typescript
// ✅ Đúng cách - Dùng service
import { userService } from '@/service/userService'

const user = await userService.getUserById(1)  // Có interceptor
```

### **Tránh:**
```typescript
// ❌ Sai cách - Direct axios không có interceptor
import axios from 'axios'

const data = await axios.get('/url')  // Không có refresh interceptor
```

---

## 🔧 Configuration

### **Development:** 
```typescript
secure: false          // HTTP localhost
maxAge: 3600           // 1 giờ
NODE_ENV: 'development'
```

### **Production:**
```typescript
secure: true           // HTTPS only
maxAge: 3600           // 1 giờ (hoặc dài hơn)
NODE_ENV: 'production'
API_URL: 'https://api.production.com'
```

---

## 📊 Token Lifecycle

```
Login
  ↓
Backend trả: {accessToken, refreshToken}
  ↓
Frontend set cookies: (httpOnly, secure, sameSite)
  ↓
Each Request: Browser tự động thêm cookies
  ↓
Token expires after 1 hour
  ↓
Next Request: Backend return 401
  ↓
Interceptor: Call /api/auth/refresh
  ↓
Refresh: POST to backend /auth/refresh-token
  ↓
Response: New accessToken + refreshToken
  ↓
Update: Frontend set mới cookies
  ↓
Retry: Original request with new token
  ↓
Continue (token reset, +1 hour thêm)
```

---

## ✅ Checklist Implement

- [x] Tạo `lib/apiClient.ts` - Axios with interceptor
- [x] Tạo `app/api/auth/refresh/route.ts` - Frontend refresh handler
- [x] Tạo `service/userService.ts` - getUserById qua apiClient
- [x] Update `app/account/page.tsx` - Dùng userService
- [x] Set `secure: false` cho development
- [x] Implement queue system - Prevent race condition
- [x] Test 401 handling - Verify auto-refresh works

---

## 🐛 Troubleshooting

### **Q: Token refresh không trigger?**
```
A: Check:
  1. Network tab: POST /api/auth/refresh gọi được không?
  2. Cookies: refreshToken có trong browser cookies không?
  3. Console logs: "[apiClient] Token expired..." in không?
```

### **Q: Request bị redirect /login-page vô tình?**
```
A: Kiểm tra:
  1. Queue system có process đúng không?
  2. refreshToken có expire không? (Cần re-login)
  3. Backend /auth/refresh-token return errors?
```

### **Q: Multiple refresh calls?**
```
A: Kiểm tra queue system:
  let isRefreshing = false  // Phải global
  if (isRefreshing) return queue  // Phải check này
```

---

## 📚 References

- **Axios Interceptors:** https://axios-http.com/docs/interceptors
- **HTTP-Only Cookies:** MDN Web Docs
- **JWT Token Refresh Pattern:** OAuth2 best practices
- **Race Condition Prevention:** Queue pattern

---

**Last Updated:** April 4, 2026  
**Status:** ✅ Fully Implemented and Tested
