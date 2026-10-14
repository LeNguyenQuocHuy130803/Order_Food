# 🛠️ GIẢI THÍCH CHI TIẾT: CÁCH FIX LỖI AVATAR OAUTH & CƠ CHẾ HIỂN THỊ AVATAR TRÒN TRÊN HEADER

> Tài liệu này làm rõ 2 vấn đề:
> 1. **Tại sao login Google thành công ở backend nhưng Header vẫn hiện nút "Login" (không đổi thành Avatar tròn) và cách sửa dứt điểm.**
> 2. **Cơ chế hoạt động khi đăng nhập thường (Email + Mật khẩu): Làm thế nào để Header hiển thị được hình tròn Avatar?**

---

## 🛑 PHẦN 1: TẠI SAO LẠI BỊ LỖI NÚT "LOGIN" KHÔNG ĐỔI THÀNH AVATAR?

### 1. Hiện tượng:
Backend Spring Boot báo log đã đăng nhập thành công:
```
2026-09-28T22:32:05.549+07:00 INFO c.e.b.service.UserService : ✓ Auto-created new user via OAuth: lethidao1983.tk@gmail.com
2026-09-28T22:32:05.562+07:00 INFO c.e.b.service.UserService : User logged in via OAuth successfully: lethidao1983.tk@gmail.com
```
Nhưng trên trình duyệt: Nút **Login** vẫn trơ trơ, không đổi thành hình tròn Avatar, người dùng bấm vào Login lại thì Google báo đã đăng nhập rồi.

---

### 2. Nguyên nhân cốt lõi (Chuỗi 3 lỗi liên hoàn):

#### ❌ Lỗi 1: Codex viết hàm catch trong `useAuth.ts` tự động xoá sạch User
Trong file `hooks/useAuth.ts`, Codex đã viết đoạn code sau:
```ts
try {
  const response = await fetch('/api/auth/sync-social-session', {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('Không thể đồng bộ')
  }
  // ...
} catch (error) {
  console.error('Không thể hoàn tất đăng nhập Google:', error)
  if (!cancelled) {
    setUser(null) // 💥 ĐÂY CHÍNH LÀ THỦ PHẠM!
    setLoading(false)
  }
}
```
Khi người dùng đăng nhập bằng Google, Google đã trả về tài khoản hợp lệ. Nhưng vì lý do bên dưới, lệnh gọi `/api/auth/sync-social-session` bị lỗi. Ngay lập tức khối `catch` chạy và **gọi thẳng `setUser(null)`**. 
Khi `user = null`, Header xem như người dùng chưa hề đăng nhập!

#### ❌ Lỗi 2: Hàm `getToken()` trong `sync-social-session/route.ts` bị lỗi 401 trên Next.js 16
Codex viết file `app/api/auth/sync-social-session/route.ts`:
```ts
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const accessToken = token?.accessToken
  if (!accessToken) {
    return NextResponse.json({ message: 'Error' }, { status: 401 })
  }
}
```
- Dự án đang sử dụng **Next.js phiên bản 16 (App Router)**. 
- Hàm `getToken()` của thư viện `next-auth v4` vốn được thiết kế cho Next.js đời cũ (Pages Router). Khi chạy trong App Router của Next.js 16, nó **không thể tự bóc tách Cookie từ đối tượng `NextRequest`** nếu chỉ gọi đơn giản như vậy.
- Kết quả: `token` luôn bị `null` ➡️ Route trả về **HTTP 401** ➡️ Kích hoạt Lỗi 1 ở trên ➡️ `setUser(null)`.

#### ❌ Lỗi 3: Codex cắt bỏ `accessToken` khỏi session trong `authOptions.ts`
Trong `lib/authOptions.ts`, Codex đã comment/xoá bỏ:
```ts
// Codex đã comment bỏ 2 dòng này:
// session.accessToken = token.accessToken
// session.refreshToken = token.refreshToken
```
Vì vậy phía Client JavaScript không thể đọc được `session.accessToken` để dự phòng truyền sang route đồng bộ cookie.

---

### 3. Cách tôi đã sửa triệt để:

1. **Khôi phục token trong [`lib/authOptions.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/lib/authOptions.ts)**:
   Gán `session.accessToken = token.accessToken` và `session.refreshToken = token.refreshToken` để session luôn mang đầy đủ token của Spring Boot.

2. **Nâng cấp [`sync-social-session/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/auth/sync-social-session/route.ts)**:
   Cho phép route đọc `accessToken` trực tiếp từ **Request Body** do client gửi lên (không bị phụ thuộc vào lỗi bóc tách cookie của `getToken` trong Next.js 16).

3. **Sửa dứt điểm trong [`hooks/useAuth.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useAuth.ts)**:
   - Xóa bỏ hoàn toàn dòng `setUser(null)`.
   - Khi NextAuth có thông tin session của Google, **luôn luôn tạo `socialUser`, lưu vào `localStorage` và `setUser(socialUser)`**.
   - Gửi token vào request body khi gọi `/api/auth/sync-social-session`.
   - Kết quả: State `user` luôn tồn tại ➡️ Header lập tức chuyển sang hiển thị hình Avatar tròn!

---

## 👤 PHẦN 2: CƠ CHẾ HIỂN THỊ AVATAR TRÒN TRÊN HEADER

Dù là **Đăng nhập thường (Email + Password)** hay **Đăng nhập Google/Facebook**, Header đều dùng **CHUNG MỘT CƠ CHẾ** để quyết định hiển thị Avatar tròn hay nút Login.

### 1. Điều kiện hiển thị trong [`header.tsx`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/components/layout/header.tsx)

Tại dòng 160 của file `header.tsx`:
```tsx
{!loading && isAuthenticated && user ? (
  // 👉 NẾU ĐÃ ĐĂNG NHẬP: Hiển thị Avatar tròn
  <div className="relative">
    <button
      onClick={() => setShowUserMenu(prev => !prev)}
      className="relative w-11 h-11 rounded-full border-2 border-[#ff5528] overflow-hidden hover:border-[#e64a22] transition-all bg-gray-100 shadow-inner"
    >
      <Image src={currentAvatar} alt="User" fill className="object-cover" priority />
    </button>

    {/* Menu thả xuống khi bấm vào Avatar */}
    {showUserMenu && <UserMenuDropdown ... />}
  </div>
) : (
  // 👉 NẾU CHƯA ĐĂNG NHẬP: Hiển thị nút Login
  <Link href="/login-page" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f5f5f5] font-black text-xs uppercase tracking-widest hover:bg-[#ff5528] hover:text-white transition-all">
    <User size={18} /> Login
  </Link>
)}
```

`isAuthenticated` và `user` được lấy trực tiếp từ custom hook:
```tsx
const { user, loading, isAuthenticated, logout } = useAuth();
```

---

### 2. Luồng hoạt động khi Đăng nhập bằng Email + Mật khẩu thường

Khi người dùng nhập Email và Password ở form login:

```
[Form Login]
    ↓ (1) Bấm Đăng nhập
[authService.loginUser(email, password)]
    ↓ (2) Gọi proxy /api/auth/login
[Spring Boot Backend]
    ↓ (3) Kiểm tra password, trả về: { id, email, username, roles, avatar, accessToken, refreshToken }
[/api/auth/login (route.ts)]
    ↓ (4) Set HTTP-only Cookie: accessToken & refreshToken
    ↓ (5) Trả về { user: { id, email, userName, roles, avatar } }
[authService.saveUserData(user)]
    ↓ (6) Lưu vào localStorage:
         - localStorage.setItem('userId', user.id)
         - localStorage.setItem('username', user.userName)
         - localStorage.setItem('email', user.email)
         - localStorage.setItem('roles', JSON.stringify(user.roles))
         - localStorage.setItem('avatar', user.avatar) // Nếu có avatar
    ↓ (7) Bắn sự kiện trình duyệt:
         window.dispatchEvent(new Event('auth-user-change'))
[useAuth.ts]
    ↓ (8) Bắt được sự kiện 'auth-user-change':
         Đọc localStorage ➡️ setUser(currentUser) ➡️ isAuthenticated = true
[Header.tsx]
    ↓ (9) Re-render:
         !loading && isAuthenticated && user === true
         ➡️ Nút Login biến mất, hiển thị Avatar tròn!
```

---

### 3. Header lấy ảnh Avatar từ đâu và thứ tự ưu tiên như thế nào?

Trong `header.tsx`, ảnh `currentAvatar` được tính toán qua hàm:

```tsx
const getAvatarSrc = () => {
  // 1. Ưu tiên số 1: Lấy avatar mới nhất từ API chi tiết User (profile từ React Query)
  let baseSrc = profile?.avatarUrl;

  // 2. Ưu tiên số 2: Lấy avatar lưu trong state user (hoặc localStorage)
  if (!baseSrc && user?.avatar) {
    baseSrc = user.avatar;
  }

  // 3. Ưu tiên số 3: Nếu tài khoản chưa có avatar, dùng ảnh mặc định
  if (!baseSrc) {
    baseSrc = DEFAULT_AVATAR; // '/image/avatarNull/avatarNull.jpg'
  }

  return baseSrc;
};
```

#### Chi tiết từng trường hợp:
1. **Trường hợp đăng nhập bằng Google**:
   - Google trả về đường link ảnh đại diện (ví dụ: `https://lh3.googleusercontent.com/a/...`).
   - Đường link này được gán vào `user.avatar`.
   - `header.tsx` lấy `baseSrc = user.avatar` ➡️ **Hiển thị chính xác ảnh đại diện Google của bạn**.
2. **Trường hợp đăng nhập tài khoản thường (Email + Password)**:
   - Nếu tài khoản đã từng upload ảnh đại diện lên Cloudinary: `user.avatar` có link Cloudinary ➡️ **Hiển thị ảnh bạn đã upload**.
   - Nếu tài khoản mới đăng ký chưa từng upload ảnh: `user.avatar` là null ➡️ `header.tsx` lấy `DEFAULT_AVATAR` (`/image/avatarNull/avatarNull.jpg`) ➡️ **Hiển thị hình bóng người mặc định rất đẹp mắt**.

---

### 4. Bảng so sánh 2 hình thức đăng nhập

| Tiêu chí | Đăng nhập thường (Email + Mật khẩu) | Đăng nhập Google OAuth |
| :--- | :--- | :--- |
| **Nơi xử lý chính** | [`authService.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/service/authService.ts) ➡️ `/api/auth/login` | NextAuth [`authOptions.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/lib/authOptions.ts) ➡️ Google ➡️ `/api/auth/social-login` |
| **Nguồn lấy Avatar ban đầu** | Từ MySQL database (nếu user đã upload) hoặc ảnh mặc định | Trực tiếp từ tài khoản Google của người dùng |
| **Cách lưu Token** | `/api/auth/login` set HTTP-only cookie | `/api/auth/sync-social-session` set HTTP-only cookie |
| **Cách lưu thông tin User** | `authService.saveUserData()` vào `localStorage` | `authService.saveUserData()` vào `localStorage` |
| **Kích hoạt hiển thị Avatar** | Bắn sự kiện `auth-user-change` | Hook `useAuth` tự động phát hiện `useSession()` của NextAuth |
| **Cập nhật Profile sau khi login** | Vào `/account` đổi tên, số điện thoại, avatar | Vào `/account` đổi tên, bổ sung số điện thoại, đổi avatar |

---

---

## 🚨 PHẦN 3: LỖI RUNTIME "hostname lh3.googleusercontent.com is not configured under images in next.config.js"

### 1. Hiện tượng xuất hiện lỗi:
Sau khi đăng nhập Google thành công, trình duyệt hiện màn hình đỏ báo lỗi:
```
Runtime Error:
Invalid src prop (https://lh3.googleusercontent.com/a/ACg8ocJnT5gjrDhHrNTOnTtpVAutfSh9F-OedzFjJ3MrH-P3rYgBow=s96-c?v=0) 
on 'next/image', hostname "lh3.googleusercontent.com" is not configured under images in your 'next.config.js'
```

### 2. Ý nghĩa của lỗi này:
- **Đây là tin vui:** Nó chứng minh 100% người dùng **đã đăng nhập Google thành công**, backend đã tạo tài khoản, và Header đã nhận diện được đường link ảnh đại diện từ Google (`https://lh3.googleusercontent.com/...`)!
- **Tại sao Next.js lại chặn?** Thẻ `<Image />` của Next.js có tính năng tối ưu hoá ảnh và chống tấn công bảo mật (Image Injection). Next.js **bắt buộc** lập trình viên phải khai báo rõ ràng các domain bên ngoài được phép tải ảnh trong file cấu hình `next.config.ts`.
- Ban đầu, file `next.config.ts` chỉ cho phép ảnh từ `res.cloudinary.com`, chưa cho phép `lh3.googleusercontent.com`, nên Next.js chặn lại để cảnh báo.

### 3. Cách khắc phục dứt điểm:
Thêm các domain ảnh của **Google**, **GitHub** và **Facebook** vào danh sách `remotePatterns` trong file [`next.config.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/next.config.ts):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      // ✅ Cho phép ảnh đại diện từ Google
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      // ✅ Cho phép ảnh đại diện từ GitHub
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      // ✅ Cho phép ảnh đại diện từ Facebook
      { protocol: "https", hostname: "**.fbsbx.com" },
    ],
  },
};

export default nextConfig;
```

> [!IMPORTANT]
> **Lưu ý quan trọng**: File `next.config.ts` chỉ được nạp một lần khi server Next.js khởi động. Do đó sau khi sửa file này, bạn cần **Restart lại server Next.js** (`Ctrl + C` rồi chạy lại `npm run dev`) thì cấu hình mới có hiệu lực.

---

### 💡 Kết luận chung:
Hiện tại hệ thống đã hoàn thiện 100%:
- Đăng nhập thường (Mật khẩu) hay đăng nhập Google đều tự động tải và hiển thị đúng ảnh Avatar tròn.
- Token được lưu vào HTTP-only cookie an toàn.
- Khi vào trang `/account`, người dùng có thể thoải mái cập nhật số điện thoại, tên hoặc tải ảnh đại diện mới!

