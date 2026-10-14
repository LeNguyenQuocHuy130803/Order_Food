# 📘 BÁO CÁO TOÀN DIỆN: GIẢI PHÁP XÁC THỰC 3 TẦNG & CẨM NANG HƯỚNG DẪN XÂY DỰNG TỪ ĐẦU

> **Dành cho:** Nhà phát triển Frontend & Backend dự án Web Order Food  
> **Chủ đề:** Xử lý triệt để lỗi hết hạn Token, màn hình đỏ Next.js, tự động gia hạn phiên (Sliding Session) và bảo vệ trang riêng tư chuẩn kiến trúc các trang web lớn (Shopee, Tiki, Facebook, Google).

---

## MỤC LỤC

1. [Bản chất vấn đề trước khi sửa (Tại sao bị lỗi?)](#1-bản-chất-vấn-đề-trước-khi-sửa)
2. [Kiến trúc bảo mật Backend For Frontend (BFF) là gì?](#2-kiến-trúc-bảo-mật-backend-for-frontend-bff)
3. [Chi tiết cách giải quyết 3 Tầng đã thực hiện](#3-chi-tiết-cách-giải-quyết-3-tầng-đã-thực-hiện)
   - [Tầng 1: Sliding Session (Gia hạn phiên động 30 ngày)](#tầng-1-sliding-session-gia-hạn-phiên-động-30-ngày)
   - [Tầng 2: Silent Logout & Interceptor không Crash](#tầng-2-silent-logout--interceptor-không-crash)
   - [Tầng 3: Auth Guard & Giao diện thân thiện (Graceful Degradation)](#tầng-3-auth-guard--giao-diện-thân-thiện)
4. [Bảng so sánh: Trước vs Sau khi sửa](#4-bảng-so-sánh-trước-vs-sau-khi-sửa)
5. [CẨM NANG HƯỚNG DẪN TỪ ĐẦU ĐỂ TỰ LÀM CHO MỌI DỰ ÁN](#5-cẩm-nang-hướng-dẫn-từ-đầu)
   - [Bước 1: Viết API Route Login (Set Cookie HttpOnly)](#bước-1-viết-api-route-login)
   - [Bước 2: Viết API Route Refresh Token](#bước-2-viết-api-route-refresh-token)
   - [Bước 3: Viết API Client Auto-Refresh (`apiFetch`)](#bước-3-viết-api-client-auto-refresh)
   - [Bước 4: Viết Hook Quản lý trạng thái Auth (`useAuth`)](#bước-4-viết-hook-quản-lý-auth)
   - [Bước 5: Viết Hook Bảo vệ trang nhạy cảm (`useRequireAuth`)](#bước-5-viết-hook-bảo-vệ-trang-riêng-tư)
   - [Bước 6: Tối ưu các Hook dữ liệu (như Giỏ hàng `useCartQuery`)](#bước-6-tối-ưu-các-hook-dữ-liệu)

---

## 1. BẢN CHẤT VẤN ĐỀ TRƯỚC KHI SỬA

Trước đây, khi bạn đăng nhập tài khoản hôm nay, tắt máy đi ngủ rồi sáng hôm sau mở web lên, bạn gặp 2 hiện tượng gây ức chế:
1. **Màn hình đỏ (Dev Overlay Crash):** Trình duyệt hiện bảng đỏ ném lỗi `Unhandled Runtime Error: Token refresh failed` và `console.error`.
2. **Bị đá văng liên tục về trang Login:** Dù bạn chỉ muốn vào trang chủ (`/`) để xem món ăn, hệ thống liên tục đá về `/login-page`.

### Tại sao lại bị như vậy?
* **Thời gian sống của Cookie bị lệch với Backend:**
  - Backend Spring Boot cấu hình: `accessToken` sống 15 phút, `refreshToken` sống **25 ngày**.
  - Nhưng trên Next.js (`login/route.ts`), cookie `refreshToken` lại chỉ được set sống **7 ngày** hoặc bị trình duyệt xóa khi hết phiên.
* **Cơ chế ném lỗi sai (`throw Error`):**
  - Trong `lib/api/api-client-refresh.ts`, khi hàm `refreshAccessToken()` gọi sang backend mà thất bại (do đã qua đêm hoặc token không còn hợp lệ), code cũ đã dùng:
    ```ts
    console.error('❌ Refresh token thất bại...')
    throw new Error('Token refresh failed') // 💥 ĐÂY LÀ THỦ PHẠM GÂY BẢNG ĐỎ NEXT.JS!
    ```
  - Trong Next.js chế độ phát triển (Dev Mode), cứ hễ có một `throw Error` không được bọc `catch` hoặc xảy ra trong microtask, Next.js sẽ bật ngay bảng lỗi màu đỏ choán hết màn hình.
* **Spam gọi API giỏ hàng (`useCartQuery`):**
  - Khách vãng lai hoặc người vừa hết hạn phiên vào trang web thì Header lập tức gọi `useCartQuery()`.
  - Do điều kiện cũ là `isAuthenticated !== false` (khi `undefined` thì vẫn là `true`), nó gửi ngay request lấy giỏ hàng `/api/carts`.
  - Backend trả về `401 Unauthorized` -> `apiFetch` lại cố đi refresh token -> lại `throw Error` -> tạo thành vòng lặp lỗi vô tận!

---

## 2. KIẾN TRÚC BẢO MẬT BACKEND FOR FRONTEND (BFF)

Tại sao không lưu JWT Access Token và Refresh Token trực tiếp vào `localStorage`?
* **Rủi ro XSS (Cross-Site Scripting):** Bất kỳ một thư viện npm bên thứ 3 nào hoặc một đoạn mã JavaScript độc hại nào bị tiêm vào website đều có thể đọc `localStorage.getItem('token')` và đánh cắp tài khoản của người dùng ngay lập tức.
* **Giải pháp BFF (Backend For Frontend):**
  1. Frontend Next.js tạo một lớp API Route nội bộ (`app/api/...`).
  2. Khi người dùng bấm Đăng nhập, trình duyệt gửi tài khoản/mật khẩu tới `app/api/auth/login`.
  3. Next.js server gửi sang Spring Boot (`http://localhost:8080/api/auth/login`).
  4. Spring Boot trả về `accessToken` và `refreshToken`.
  5. Next.js đóng gói 2 token này vào **HttpOnly Cookie** (`httpOnly: true, secure: false (dev)`). Trình duyệt sẽ tự động lưu cookie này, mã JavaScript trên client **hoàn toàn không thể đọc được**, hacker không thể đánh cắp!
  6. Next.js chỉ trả về thông tin công khai của User (id, tên, email, avatar) để lưu vào `localStorage` hiển thị lên giao diện (Header, Profile).

---

## 3. CHI TIẾT CÁCH GIẢI QUYẾT 3 TẦNG ĐÃ THỰC HIỆN

Chúng ta đã áp dụng mô hình chuẩn công nghiệp mà các nền tảng thương mại điện tử lớn (Shopee, Tiki, Lazada) sử dụng:

### TẦNG 1: Sliding Session (Gia hạn phiên động 30 ngày)
* **Ý tưởng:** Người dùng chỉ cần vào web là phiên đăng nhập tự động được kéo dài thêm. Trừ khi bỏ mặc website hơn 1 tháng không vào thì mới phải đăng nhập lại.
* **Các file đã sửa:**
  1. [`app/api/auth/login/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/auth/login/route.ts): Nâng thời hạn cookie `refreshToken` từ 7 ngày lên **30 ngày** (`30 * 24 * 3600`).
  2. [`app/api/auth/refresh/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/auth/refresh/route.ts): Khi cấp token mới, set lại cookie `refreshToken` với thời hạn **30 ngày**.
  3. [`app/api/auth/sync-social-session/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/auth/sync-social-session/route.ts): Đăng nhập Google/Facebook cũng được hưởng cookie 30 ngày.

### TẦNG 2: Silent Logout & Interceptor không Crash
* **Ý tưởng:** Việc một người dùng hết hạn token sau nhiều tuần không vào web là **chuyện hoàn toàn bình thường trong đời thực**, KHÔNG PHẢI là lỗi hệ thống (Crash). Do đó hệ thống phải xử lý êm thầm, tuyệt đối không được hiện bảng đỏ!
* **File đã sửa:** [`lib/api/api-client-refresh.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/lib/api/api-client-refresh.ts):
  - Xóa bỏ toàn bộ `throw new Error('Token refresh failed')`.
  - Thay `console.error` bằng `console.warn` để không kích hoạt Dev Error Overlay của Next.js.
  - Viết hàm `silentCleanup()`: Tự động xóa `localStorage`, xóa session NextAuth, gọi `/api/auth/logout` để xóa cookie rác, phát sự kiện `auth-user-change` để Header tự động đổi avatar thành nút "Đăng nhập".
  - Chuyển êm thầm người dùng về **Chế độ Khách vãng lai (Guest Mode)**: Họ vẫn xem được trang Home, xem món ăn Food, Drink, Fresh, Dessert bình thường như một khách chưa đăng nhập.

### TẦNG 3: Auth Guard & Giao diện thân thiện (Graceful Degradation)
* **Ý tưởng:** Phân định rõ ràng giữa **Trang công khai** và **Trang riêng tư**.
  - **Trang công khai (`/`, `/food`, `/drink`, `/fresh`, `/dessert`, `/blog`, `/about_us`, `/contact`):** Tuyệt đối không bao giờ chặn hay bắt đăng nhập. Bất kỳ ai cũng có thể vào xem.
  - **Trang riêng tư (`/account`, `/checkout`):** Tạo hook bảo vệ [`hooks/useRequireAuth.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useRequireAuth.ts). Nếu khách chưa đăng nhập gõ link vào các trang này, hook sẽ kiểm tra trạng thái và chuyển hướng nhẹ nhàng bằng `router.replace('/login-page')`, không ném lỗi.
  - **Trang Giỏ hàng (`/cart`):** Nếu khách chưa đăng nhập vào `/cart`, thay vì báo lỗi 401 hoặc sập trang, hệ thống hiển thị hộp thoại thân thiện:
    > *"Bạn chưa đăng nhập. Vui lòng đăng nhập để xem các món ăn đã lưu trong giỏ hàng của bạn."*  
    > Kèm nút bấm: **[Đăng nhập ngay]**

---

## 4. BẢNG SO SÁNH: TRƯỚC VS SAU KHI SỬA

| Tiêu chí | Trước khi sửa | Sau khi sửa (Hiện tại) |
| :--- | :--- | :--- |
| **Thời hạn nhớ tài khoản** | Tối đa 7 ngày (hoặc qua đêm bị mất) | **30 ngày liên tục** (Sliding Session) |
| **Hành vi khi token hết hạn** | Bảng đỏ Next.js ném lỗi `Unhandled Runtime Error` | **Silent Fallback** — chuyển về Khách êm ái, không có bảng đỏ |
| **Vào xem trang chủ, món ăn** | Bị chặn, tự động đá văng về `/login-page` | **Tự do 100%** — xem bình thường như khách vãng lai |
| **API Giỏ hàng (`useCartQuery`)** | Spam request 401 liên tục làm nghẽn mạng | Chỉ fetch khi đã login (`canFetchCart = true`) |
| **Trang `/account`, `/checkout`** | Bị treo xoay vòng tròn hoặc sập trang | Được bảo vệ bởi `useRequireAuth`, chuyển về login mượt mà |
| **Trang Giỏ hàng `/cart`** | Lỗi 401 | Hiện thông báo mời đăng nhập chuyên nghiệp như Shopee |

---

## 5. CẨM NANG HƯỚNG DẪN TỪ ĐẦU ĐỂ TỰ LÀM CHO MỌI DỰ ÁN

Khi bạn bắt đầu một dự án mới (Next.js + Spring Boot / Node.js JWT), hãy làm theo đúng 6 bước dưới đây:

### Bước 1: Viết API Route Login
Tạo file: `app/api/auth/login/route.ts`
```ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const credentials = await req.json()

  // 1. Gọi sang backend thực tế
  const backendRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!backendRes.ok) {
    return NextResponse.json({ message: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 })
  }

  const data = await backendRes.json()
  const { accessToken, refreshToken, user } = data

  const response = NextResponse.json({ user })

  // 2. Set Access Token (15-60 phút)
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })

  // 3. Set Refresh Token (30 ngày)
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600,
    path: '/',
  })

  return response
}
```

### Bước 2: Viết API Route Refresh Token
Tạo file: `app/api/auth/refresh/route.ts`
```ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value

  if (!refreshToken) {
    return NextResponse.json({ message: 'Không có refreshToken' }, { status: 401 })
  }

  // Gửi refreshToken sang backend để lấy cặp token mới
  const backendRes = await fetch('http://localhost:8080/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!backendRes.ok) {
    return NextResponse.json({ message: 'RefreshToken không hợp lệ' }, { status: 401 })
  }

  const { accessToken: newAccess, refreshToken: newRefresh } = await backendRes.json()
  const response = NextResponse.json({ success: true })

  // Cập nhật lại 2 cookie với thời hạn mới (Sliding Session)
  response.cookies.set('accessToken', newAccess, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })

  response.cookies.set('refreshToken', newRefresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600,
    path: '/',
  })

  return response
}
```

### Bước 3: Viết API Client Auto-Refresh (`apiFetch`)
Tạo file: `lib/api/api-client-refresh.ts`
* **Quy tắc vàng:** Không dùng `throw Error` trong hàm `refreshAccessToken` để tránh làm crash UI.
```ts
let isRefreshing = false
let failedQueue: Array<{ resolve: (val: any) => void; reject: (err: any) => void }> = []

const processQueue = () => {
  failedQueue.forEach(req => req.resolve(null))
  failedQueue = []
}

async function silentCleanup() {
  if (typeof window !== 'undefined') {
    localStorage.clear()
    window.dispatchEvent(new Event('auth-user-change'))
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
  }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST' })
    if (!res.ok) {
      await silentCleanup()
      return false
    }
    return true
  } catch {
    await silentCleanup()
    return false
  }
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let response = await fetch(url, { ...options, credentials: 'include' })

  // Nếu gặp lỗi 401 (hết hạn Access Token)
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      const success = await refreshAccessToken()
      isRefreshing = false
      processQueue()

      if (success) {
        // Thử lại request gốc với token mới đã được set trong cookie
        return fetch(url, { ...options, credentials: 'include' })
      }
    } else {
      // Có request khác đang refresh, đứng vào hàng đợi
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => fetch(url, { ...options, credentials: 'include' }).then(resolve).catch(reject),
          reject,
        })
      })
    }
  }

  return response
}
```

### Bước 4: Viết Hook Quản lý Auth (`useAuth`)
Tạo file: `hooks/useAuth.ts`
* Lắng nghe sự kiện `auth-user-change` để Header và UI tự cập nhật khi đăng nhập / đăng xuất / hết phiên.
```ts
'use client'
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const sync = () => {
    const userId = localStorage.getItem('userId')
    if (userId) {
      setUser({ id: userId, name: localStorage.getItem('username') })
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    sync()
    window.addEventListener('auth-user-change', sync)
    return () => window.removeEventListener('auth-user-change', sync)
  }, [])

  return { user, loading, isAuthenticated: Boolean(user) }
}
```

### Bước 5: Viết Hook Bảo vệ trang riêng tư (`useRequireAuth`)
Tạo file: `hooks/useRequireAuth.ts`
* Áp dụng cho `/account`, `/checkout`, `/admin`:
```ts
'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

export function useRequireAuth(redirectTo: string = '/login-page') {
  const auth = useAuth()
  const router = useRouter()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (auth.loading) return
    if (!auth.isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true
      router.replace(redirectTo)
    }
  }, [auth.loading, auth.isAuthenticated, redirectTo, router])

  return auth
}
```

### Bước 6: Tối ưu các Hook dữ liệu (như Giỏ hàng `useCartQuery`)
Tạo file: `hooks/useCartQuery.ts`
* Luôn kiểm tra `enabled: canFetchCart` để không bao giờ gửi request khi người dùng chưa đăng nhập.
```ts
export function useCartQuery(isAuthenticatedParam?: boolean) {
  const { isAuthenticated: authIsAuth } = useAuth()
  const canFetchCart = Boolean(isAuthenticatedParam !== undefined ? isAuthenticatedParam : authIsAuth)

  return useQuery({
    queryKey: ['cart'],
    queryFn: () => CartService.getCart(),
    enabled: canFetchCart, // 🔒 Chỉ chạy khi đã đăng nhập!
    staleTime: 5 * 60 * 1000,
  })
}
```

---

## 6. KẾT LUẬN
Toàn bộ hệ thống Frontend hiện tại đã được nâng cấp đồng bộ theo đúng chuẩn kiến trúc 3 tầng:
1. **Phiên đăng nhập bền bỉ 30 ngày**, tự động làm mới khi người dùng hoạt động.
2. **Không còn hiện tượng màn hình đỏ hay văng trang.** Khi phiên hết hạn, hệ thống tự lùi về chế độ khách vãng lai an toàn.
3. **Các trang riêng tư được bảo vệ nghiêm ngặt** nhưng chuyển hướng êm ái, giỏ hàng cung cấp trải nghiệm thân thiện nhất cho người dùng.
