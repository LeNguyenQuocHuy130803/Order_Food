# 🎯 Management Account - Hệ thống Quản lí Tài khoản

## 📋 Tổng quan

Hệ thống **Management Account** cho phép người dùng xem và quản lí thông tin cá nhân, địa chỉ, đơn hàng và cài đặt tài khoản. Dữ liệu được lấy từ **backend API** qua đúng quyền xác thực (token).

---

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 13+)                   │
│                                                             │
│  1. Account Page (/account)                               │
│     ├── Loads user data from login cache                  │
│     ├── Calls getUserById(user.id) API                    │
│     └── Displays: Profile, Orders, Addresses, Settings   │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend API Routes (Routes Handler)           │
│                                                             │
│  2. /api/users/[id]/route.ts                              │
│     ├── Reads token from HTTP-Only cookies               │
│     ├── Validates token exists                            │
│     └── Forwards request to backend with Bearer token    │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Backend API (Spring Boot 8080)                     │
│                                                             │
│  3. GET /api/users/{id}                                   │
│     ├── Authenticates user via JWT token                 │
│     ├── Fetches user detail from database                │
│     └── Returns full user info (userName, phoneNumber,   │
│         addresses, status, etc.)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Files Tham gia

### 1. **app/account/page.tsx** - Trang chính
- **Mục đích**: Hiển thị dashboard tài khoản với 4 tabs
- **Chức năng**:
  - Sidebar: Profile card + Menu navigation
  - Main content: Hiển thị Profile/Orders/Addresses/Settings
  - Gọi `getUserById()` khi component mount
  - Xử lý loading + error states

```tsx
// Khi load trang
useEffect(() => {
  if (user && !loading) {
    const fetchUserDetail = async () => {
      const userDetail = await authService.getUserById(user.id)
      setProfile(userDetail)
    }
    fetchUserDetail()
  }
}, [user, loading])
```

### 2. **service/authService.ts** - Service logic
- **Mục đích**: Centralize tất cả auth logic
- **Exports**:
  - `loginUser()` - Đăng nhập user
  - `getCurrentUser()` - Lấy user từ localStorage
  - `getUserById()` - **NEW** Lấy chi tiết user bằng ID
  - `logout()` - Logout user
  - `saveUserData()` - Lưu user vào localStorage

```typescript
// Mới thêm:
export interface UserDetail extends AuthUser {
  phoneNumber?: string
  addresses?: Array<{
    id: number
    type: string
    address: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
  }>
  status?: string
  emailVerified?: boolean
  lastLogin?: string
  createdAt?: string
  updatedAt?: string
}

export async function getUserById(userId: number): Promise<UserDetail> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 🔒 Gửi token tự động
  })
  // Xử lý response...
  return data
}
```

### 3. **app/api/users/[id]/route.ts** - API Route Handler
- **Mục đích**: Proxy giữa frontend và backend
- **Chức năng**:
  - Đọc token từ HTTP-Only cookies
  - Validate token exists
  - Forward request đến backend `/api/users/{id}`
  - Gửi token qua Authorization header (Bearer)
  - Return user detail từ backend

```typescript
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  // 1. Await params (Next.js 13+)
  const { id } = await props.params
  
  // 2. Lấy token từ cookies
  const token = request.cookies.get('accessToken')?.value
  
  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // 3. Forward tới backend
  const response = await fetch(`http://localhost:8080/api/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
  
  // 4. Trả về response
  return NextResponse.json(await response.json())
}
```

### 4. **app/api/auth/login/route.ts** - Login Route
- **Mục đích**: Xử lý login + set HTTP-only cookies
- **Ghi token** vào cookies khi login thành công

---

## 🔄 Quy trình làm việc (Flow)

### Khi user đăng nhập:
```
1. User nhập email + password
   ↓
2. loginForm gọi authService.loginUser()
   ↓
3. Call /api/auth/login (route handler)
   ↓
4. Route handler forward tới backend /auth/login
   ↓
5. Backend xác thực → trả về accessToken + refreshToken
   ↓
6. Route handler SET HTTP-Only cookies với tokens
   ↓
7. Return user info (id, username, email, roles, avatar)
   ↓
8. Frontend lưu user info vào localStorage
   ↓
9. Tokens ở HTTP-Only cookies (browser tự động gửi)
```

### Khi user vào trang /account:
```
1. Account page mount
   ↓
2. useAuth hook đọc user từ localStorage
   ↓
3. useEffect gọi authService.getUserById(user.id)
   ↓
4. Call /api/users/{id} (với credentials: 'include')
   ↓
5. Browser tự động gửi accessToken từ cookies
   ↓
6. Route handler kiểm tra token + forward tới backend
   ↓
7. Backend xác thực token → return full user detail
   ↓
8. Frontend nhận: { userName, phoneNumber, addresses, ... }
   ↓
9. Display thông tin trên Account page
```

---

## 🔐 Bảo mật

### Token lưu ở đâu?
| Token | Lưu ở | Bảo mật | Truy cập |
|-------|-------|--------|---------|
| **accessToken** | HTTP-Only cookies | 🔒 Cao (server-side) | Browser tự động gửi |
| **refreshToken** | HTTP-Only cookies | 🔒 Cao (server-side) | Browser tự động gửi |
| **User info** | localStorage | ⚠️ Trung bình | Frontend JS (cần) |

### Tại sao HTTP-Only cookies?
✅ **XSS Protection**: JavaScript không thể truy cập (ngay cả malicious script)
✅ **CSRF Protection**: sameSite=lax ngăn CSRF attack
✅ **Browser auto-send**: Tự động gửi khi call API
✅ **Server-side only**: Chỉ server biết token value

---

## 📊 Data Structure

### Login Response:
```json
{
  "user": {
    "id": 2,
    "email": "user@gmail.com",
    "username": "lê enguyễn quốc hoàng",
    "roles": ["Customers"],
    "avatar": "https://..."
  }
  // Token ở cookies (không return)
}
```

### GetById Response (Backend):
```json
{
  "id": 2,
  "email": "user@gmail.com",
  "userName": "lê enguyễn quốc hoàng",
  "phoneNumber": "0935270131",
  "role": "Customers",
  "avatar": "https://...",
  "status": "ACTIVE",
  "emailVerified": true,
  "lastLogin": "2026-04-04T12:05:34",
  "addresses": [
    {
      "id": 1,
      "type": "WORK",
      "address": "123 Đường Nguyễn Huệ, Quận 1, TP.HCM",
      "isDefault": false,
      "createdAt": "2026-04-04T08:55:28",
      "updatedAt": "2026-04-04T08:55:28"
    },
    {
      "id": 2,
      "type": "HOME",
      "address": "43 Hòa Phước, Đà Nẵng",
      "isDefault": true,
      "createdAt": "2026-04-04T08:56:01",
      "updatedAt": "2026-04-04T08:56:01"
    }
  ],
  "createdAt": "2026-03-24T10:22:57",
  "updatedAt": "2026-04-04T12:05:34"
}
```

---

## 🎨 UI Layout

### Responsive Design:
```
📱 Mobile (< 1024px):
┌──────────────────┐
│   Sidebar Top    │  ← Profile card + menu buttons
├──────────────────┤
│   Main Content   │  ← Profile info / Orders / Addresses / Settings
└──────────────────┘

💻 Desktop (≥ 1024px):
┌────────────┬──────────────────────┐
│  Sidebar   │   Main Content       │
│  (sticky)  │   (Profile info /    │
│            │    Orders / ...)     │
└────────────┴──────────────────────┘
```

### Tabs:
1. **Profile** - Hiển thị: Username, Email, Phone, Member Since, Default Address
2. **Orders** - Placeholder (chưa implement)
3. **Addresses** - Placeholder (chưa implement)
4. **Settings** - Placeholder (chưa implement)

---

## 🚀 Cách sử dụng

### 1. Khi user đã login:
```typescript
// Account page ở /account
// Tự động load user detail từ API
// Hiển thị Profile Information
```

### 2. Khi muốn lấy user detail:
```typescript
import { authService } from '@/service/authService'

const userDetail = await authService.getUserById(userId)
console.log(userDetail.phoneNumber)  // "0935270131"
console.log(userDetail.addresses)    // [...]
```

### 3. Field mapping:
| Backend | Frontend | Kiểu |
|---------|----------|------|
| `userName` | `profile.userName` | string |
| `email` | `profile.email` | string |
| `phoneNumber` | `profile.phoneNumber` | string |
| `addresses` | `profile.addresses` | array |
| `createdAt` | `profile.createdAt` | ISO date string |

---

## ⚠️ Common Issues

### 1. "Unauthorized - No token provided"
❌ Token không exist trong cookies
✅ **Fix**: Đảm bảo user đã login thành công (check `/api/auth/login` set cookies)

### 2. "id: undefined"
❌ params là Promise nhưng chưa await
✅ **Fix**: Sử dụng `await props.params` trong route handler

### 3. "phoneNumber returns undefined"
❌ Lấy `profile.phone` thay vì `profile.phoneNumber`
✅ **Fix**: Dùng đúng field name từ backend response

### 4. "Full Name / Default Address không hiển thị"
❌ Backend response trả về `userName` chứ không phải `fullName`
✅ **Fix**: Show `profile.userName`, tìm address có `isDefault: true`

---

## 🔧 Configuration

### Environment Variables:
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### API Endpoints:
| Method | Endpoint | Mục đích |
|--------|----------|---------|
| POST | `/api/auth/login` | Login + set cookies |
| GET | `/api/users/[id]` | Get user detail (cần token) |
| POST | `/api/auth/logout` | Logout + clear cookies |

---

## 📝 Notes

- ✅ Token lưu HTTP-Only cookies (bảo mật)
- ✅ User info lưu localStorage (nhanh, không cần API)
- ✅ Account page gọi getById để lấy detail mới nhất
- ✅ Sidebar sticky (dễ navigation)
- ✅ Loading + Error states (UX better)
- ✅ Responsive design (mobile friendly)

---

## 🎯 Next Steps (TODO)

- [ ] Implement Orders tab - Fetch user orders từ API
- [ ] Implement Addresses tab - Show / add / edit addresses
- [ ] Implement Settings tab - Change password, email preferences
- [ ] Implement Edit functionality - Update profile fields
- [ ] Add form validation - Kiểm tra input trước khi submit
- [ ] Add API integration - Call backend khi update profile

---

**Cập nhật**: 2026-04-04  
**Created by**: Development Team
