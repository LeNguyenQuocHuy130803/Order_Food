# 📋 KẾ HOẠCH RÀ SOÁT TOÀN DIỆN FRONTEND (PLAN 2)
> **Thời điểm lập:** 29/09/2026  
> **Dự án:** Frontend E-Commerce (`frontend_Order_User/e-commerce-interface`)  
> **Mục tiêu:** Rà soát toàn bộ thay đổi từ tối qua đến nay, phát hiện file dư thừa, code chết, code sai, lỗi tiềm ẩn và đề xuất lộ trình xử lý triệt để.

---

## 📌 PHẦN 1: TỔNG QUAN TÌNH TRẠNG DỰ ÁN

| Hạng mục | Trạng thái hiện tại | Đánh giá |
| :--- | :--- | :--- |
| **Biên dịch TypeScript** | `npx tsc --noEmit` hoàn thành với **0 lỗi** (Exit code 0) | ✅ Hệ thống kiểu dữ liệu đã đồng bộ |
| **Quy mô thay đổi** | **154 file** bị tác động (1.726 dòng thêm mới, 6.787 dòng dọn dẹp) | ⚡ Tái cấu trúc rất lớn từ hôm qua |
| **Tái cấu trúc API** | Bỏ 4 service đơn lẻ (`Food`, `Drink`, `Dessert`, `Fresh`) hợp nhất về `ProductService` | ✅ Giảm trùng lặp code lớn |
| **Hệ thống Auth** | Tích hợp OAuth Google + Spring Boot JWT, HTTP-only Cookies | ✅ Đã xử lý cơ chế avatar & tránh loop redirect |

---

## 📂 PHẦN 2: BẢNG TỔNG HỢP CÁC FILE ĐÃ SỬA & MỚI THÊM (TỪ TỐI QUA ĐẾN NAY)

### 1. Nhóm Xác thực & Bảo mật (Auth & Session)
| File | Loại thay đổi | Chi tiết đã làm |
| :--- | :--- | :--- |
| [`lib/authOptions.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/lib/authOptions.ts) | Modified | Tích hợp Google OAuth Provider, xử lý callback JWT & Session, gọi backend `/auth/social-login`. |
| [`lib/api/api-client-refresh.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/lib/api/api-client-refresh.ts) | Modified | Fix lỗi chuyển hướng vô tận (vòng lặp redirect) khi token hết hạn: đổi `signOut({ redirect: false })`, xóa localStorage và bắn event `auth-user-change`. |
| [`hooks/useAuth.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useAuth.ts) | Modified | Đồng bộ trạng thái user giữa NextAuth session và localStorage, xử lý avatar fallback. |
| [`service/authService.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/service/authService.ts) | Modified | Gọi qua Next.js route `/api/auth/login`, quản lý event cập nhật user. |
| [`app/api/auth/sync-social-session/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/auth/sync-social-session/route.ts) | **Mới tạo** | Proxy ghi token JWT từ session xã hội vào HTTP-only cookie phía server. |
| [`app/api/auth/forgot-password/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/auth/forgot-password/route.ts) | **Mới tạo** | Proxy gửi OTP quên mật khẩu về email. |
| [`app/api/auth/reset-password/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/auth/reset-password/route.ts) | **Mới tạo** | Proxy đặt lại mật khẩu với OTP. |
| [`app/api/auth/change-password/send-otp/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/auth/change-password/send-otp/route.ts) | **Mới tạo** | Proxy gửi OTP đổi mật khẩu trong trang Account. |
| [`next.config.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/next.config.ts) | Modified | Thêm cấu hình `remotePatterns` cho `lh3.googleusercontent.com`, `avatars.githubusercontent.com`, `platform-lookaside.fbsbx.com` để Next Image hiển thị được avatar bên thứ 3. |

### 2. Nhóm Sản phẩm & Hooks (Unified Products)
| File | Loại thay đổi | Chi tiết đã làm |
| :--- | :--- | :--- |
| [`service/ProductService.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/service/ProductService.ts) | **Mới tạo** | Hợp nhất toàn bộ API gọi sản phẩm: `getProductsPaginated`, `filterProducts`, `getProductById`. |
| [`types/product.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/types/product.ts) | **Mới tạo** | Chứa định nghĩa kiểu `FilterParams`. |
| [`hooks/useProductsQuery.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useProductsQuery.ts) | **Mới tạo** | React Query hook dùng chung cho việc lấy danh sách sản phẩm có phân trang và bộ lọc. |
| [`app/api/products/paging/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/products/paging/route.ts) | **Mới tạo** | Proxy lấy sản phẩm phân trang từ backend (Public route). |
| [`app/api/products/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/products/route.ts) | **Mới tạo** | Proxy lọc và tìm kiếm sản phẩm từ backend (Public route). |
| [`app/api/products/[id]/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/products/[id]/route.ts) | **Mới tạo** | Proxy xem chi tiết một sản phẩm theo ID từ backend (Public route). |
| [`hooks/useFoodsQuery.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useFoodsQuery.ts) | Modified | Refactor dùng `ProductService` với category `FOOD`. |
| [`hooks/useDrinksQuery.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useDrinksQuery.ts) | Modified | Refactor dùng `ProductService` với category `DRINK`. |
| [`hooks/useDessertQuery.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useDessertQuery.ts) | Modified | Refactor dùng `ProductService` với category `DESSERT`. |
| [`hooks/useFreshQuery.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useFreshQuery.ts) | Modified | Refactor dùng `ProductService` với category `FRESH`. |
| `app/food/**`, `app/drink/**`, `app/dessert/**`, `app/fresh/**` | Modified | Chuyển đổi dữ liệu sang kiểu `Product` mới. |

### 3. Nhóm Giỏ hàng, Đơn hàng & Thanh toán
| File | Loại thay đổi | Chi tiết đã làm |
| :--- | :--- | :--- |
| [`service/CartService.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/service/CartService.ts) | Modified | Đồng bộ gọi `apiFetch` (có auto-refresh token), chuẩn hóa kiểu trả về. |
| [`service/OrderService.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/service/OrderService.ts) | Modified | Bổ sung hàm `createOrder`, `getOrders`, `getOrderDetail`, `cancelOrder`. |
| [`app/api/carts/items/[id]/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/carts/items/[id]/route.ts) | **Mới tạo** | Route cập nhật số lượng (`PATCH`) và xóa item (`DELETE`) trong giỏ hàng. |
| [`app/api/orders/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/orders/route.ts) | **Mới tạo** | Route lấy danh sách đơn hàng có phân trang và lọc theo trạng thái. |
| [`app/api/orders/[id]/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/orders/[id]/route.ts) | **Mới tạo** | Route lấy chi tiết và hủy đơn hàng. |
| [`app/api/orders/checkout/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/orders/checkout/route.ts) | **Mới tạo** | Route tạo đơn hàng từ giỏ hàng. |
| [`app/checkout/page.tsx`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/checkout/page.tsx) | Modified | Cập nhật luồng thanh toán: tạo order qua `OrderService` -> nếu PayPal thì tạo payment và redirect trực tiếp. |
| [`app/payment/success/page.tsx`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/payment/success/page.tsx) | Modified | Xử lý capture thanh toán PayPal và xóa các giỏ hàng đã thanh toán. |
| [`app/payment/cancel/page.tsx`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/payment/cancel/page.tsx) | Modified | Hủy đơn hàng và hoàn lại tồn kho khi user bấm Cancel trên PayPal. |

---

## 🗑️ PHẦN 3: RÀ SOÁT FILE DƯ THỪA & FOLDER RỖNG (CẦN XÓA)



### 2. Thư mục `app/order/` (`app/order/page.tsx` & `app/order/OrdersTab.tsx`)
- **Tình trạng:**
  - `app/order/OrdersTab.tsx` chỉ có 1 dòng duy nhất: `export { OrdersTab } from '@/app/account/OrdersTab'`.
  - `app/order/page.tsx` chỉ hiển thị component này trong thẻ `<div>` trần, không có Header, không có Footer, không có layout.
  - Toàn bộ ứng dụng điều hướng xem đơn hàng qua trang [`app/account/page.tsx`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/account/page.tsx) (Tab "Orders").
- **Nguyên nhân:** File tạo tạm để test khi code giao diện Order.
- **Đề xuất:** ❌ **Xóa bỏ thư mục `app/order/`** để tránh tạo ra route rác `/order` không có layout chuẩn.

### 3. File `app/api/checkout/route.ts`
- **Tình trạng:** Route này định nghĩa `POST /api/checkout` (nhận order + paypal). Tuy nhiên, trong toàn bộ mã nguồn frontend, trang `app/checkout/page.tsx` và `service/` đều gọi trực tiếp `OrderService.createOrder` (`/api/orders/checkout`) và `createPaypalOrder` (`/api/payments/paypal/create-payment`).
- **Nguyên nhân:** Code thử nghiệm gộp đơn hàng và thanh toán vào 1 endpoint nhưng không được ứng dụng thực tế sử dụng.
- **Đề xuất:** ❌ **Xóa file `app/api/checkout/route.ts`** để tránh nhầm lẫn giữa `/api/checkout` và `/api/orders/checkout`.

### 4. File `app/payment/checkout/page.tsx`
- **Tình trạng:** Đây là trang trung gian cũ (`/payment/checkout?orderId=...`). Hiện tại ở `app/checkout/page.tsx` (dòng 110), sau khi bấm đặt hàng PayPal, hệ thống redirect trực tiếp tới `payment.approveUrl` của PayPal. Không có bất kỳ liên kết hay redirect nào dẫn tới `/payment/checkout`.
- **Đề xuất:** ❌ **Xóa file `app/payment/checkout/page.tsx`** hoặc dọn dẹp nếu không còn sử dụng.

---

## ⚠️ PHẦN 4: RÀ SOÁT CODE SAI, LỖI TIỀM ẨN & THIẾU SÓT (BUGS)

Đây là những vấn đề cốt lõi cần phải xử lý ngay:

### 🚨 LỖI 1: Trang Blog BỊ LỖI 404 DO THIẾU API PROXY ROUTE (Nghiêm trọng)
- **Vị trí:** [`service/BlogService.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/service/BlogService.ts) (dòng 14 & 39).
- **Hiện tượng:**
  ```ts
  apiFetch(`/api/blogs?page=${page}&size=${size}`)
  apiFetch(`/api/blogs/${id}`)
  ```
  Nhưng trong `app/api/` **hoàn toàn KHÔNG có** thư mục `app/api/blogs/`!
- **Hệ quả:** Khi người dùng vào `/blog` hoặc `/blog/[id]`, trang sẽ gọi tới `localhost:3000/api/blogs` -> Next.js trả về **404 Not Found** -> Trang Blog bị trắng hoặc báo lỗi API Error: 404!
- **Đề xuất sửa:** Tạo 2 file proxy route tương tự như Products:
  1. `app/api/blogs/route.ts` (Proxy tới `http://localhost:8080/api/blogs`)
  2. `app/api/blogs/[id]/route.ts` (Proxy tới `http://localhost:8080/api/blogs/${id}`)

---

### 🚨 LỖI 2: Sai Fallback URL trong `app/api/orders/[id]/route.ts`
- **Vị trí:** [`app/api/orders/[id]/route.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/api/orders/[id]/route.ts) (dòng 10).
- **Hiện tượng:**
  ```ts
  // Dòng 10:
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  // Dòng 27 & 85:
  const backendUrl = `${API_URL}/orders/${id}`
  ```
- **Hệ quả:** Tất cả các route khác đều fallback về `http://localhost:8080/api`. Riêng file này fallback về `http://localhost:8080` (thiếu `/api`). Nếu biến môi trường `NEXT_PUBLIC_API_URL` gặp trục trặc, URL sẽ thành `http://localhost:8080/orders/1` thay vì `http://localhost:8080/api/orders/1`, dẫn đến 404 từ backend Spring Boot!
- **Đề xuất sửa:** Sửa dòng 10 thành:
  ```ts
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
  ```

---

### 🚨 LỖI 3: Spam gọi API Giỏ hàng khi chưa đăng nhập (`useCartQuery`)
- **Vị trí:** [`hooks/useCartQuery.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/hooks/useCartQuery.ts) (dòng 15-16), [`app/cart/page.tsx`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/cart/page.tsx) (dòng 15), [`app/checkout/page.tsx`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/app/checkout/page.tsx) (dòng 19).
- **Hiện tượng:**
  ```ts
  export function useCartQuery(isAuthenticated?: boolean) {
    const canFetchCart = isAuthenticated !== false
  ```
  Khi gọi `useCartQuery()` mà không truyền đối số (mặc định là `undefined`), thì `undefined !== false` là **`true`**!
  Do đó, khi khách vãng lai (chưa đăng nhập) vào `/cart` hoặc `/checkout`:
  1. Hook vẫn tự động kích hoạt `getCart()`.
  2. `GET /api/carts` trả về **401 Unauthorized** vì không có cookie `accessToken`.
  3. `apiFetch` bắt 401, cố gắng gọi `POST /api/auth/refresh` để refresh token -> thất bại vì khách không có `refreshToken`.
  4. React Query thử lại 2 lần (`retry: 2`). Tổng cộng sinh ra 6 network request lỗi vô ích!
- **Đề xuất sửa:**
  - Trong `useCartQuery`: đổi điều kiện thành `const canFetchCart = Boolean(isAuthenticated)`.
  - Trong `app/cart/page.tsx` và `app/checkout/page.tsx`: lấy `const { isAuthenticated } = useAuth()` và truyền `useCartQuery(isAuthenticated)`.

---

### 🚨 LỖI 4: Route Proxy Địa chỉ người dùng bị map nhầm vào User ID
- **Vị trí:** [`service/AddressService.ts`](file:///d:/Web%20Order_Food/frontend_Order_User/e-commerce-interface/service/AddressService.ts) (dòng 20).
- **Hiện tượng:**
  `AddressService` gọi `apiFetch('/api/users/addresses')`. Nhưng trong `app/api/users/` chỉ có duy nhất `[id]/route.ts`. Next.js sẽ coi chuỗi `"addresses"` chính là tham số `id` (`id = "addresses"`).
  Vô tình ở backend Spring Boot, `AddressController` có `@RequestMapping("/api/users/addresses")` nên request GET trùng hợp chạy được, nhưng log Next.js in ra:
  ```
  🔍 [GET /api/users/addresses] Fetching user detail...
  ```
  Và nếu cần gọi `POST /api/users/addresses` (thêm địa chỉ mới) hoặc `DELETE` (xóa địa chỉ) thì `[id]/route.ts` không hỗ trợ vì chỉ có `GET` và `PATCH` cho User Profile!
- **Đề xuất sửa:** Tạo route độc lập chuyên biệt: `app/api/users/addresses/route.ts` (hỗ trợ `GET`, `POST`) và `app/api/users/addresses/[addressId]/route.ts` (hỗ trợ `DELETE`, `PUT`).

---

### 🚨 LỖI 5: Bộ lọc danh mục con (Subcategories) trên UI không hoạt động
- **Vị trí:** `app/components/filter_sidebar.tsx`, `app/dessert/DessertPageClient.tsx`, `hooks/useDessertQuery.ts`.
- **Hiện tượng:**
  Trên giao diện có bộ lọc với các checkbox: Cake, Cookie, Cheesecake, Donut...
  Khi người dùng click chọn, URL sinh ra `?categories=CAKE&categories=DONUT`.
  Nhưng ở backend: toàn bộ bảng cũ đã gộp vào bảng `products`, thực thể `Product` chỉ có enum `category` (FOOD, DRINK, FRESH, DESSERT), không có trường subcategory.
  Và trong `useDessertQuery.ts` (dòng 27-34): code chỉ lấy `featured`, `unit`, `minPrice`, `maxPrice`, `region` chứ **hoàn toàn bỏ qua `categories`**.
- **Hệ quả:** Người dùng tick chọn loại bánh / loại nước nhưng danh sách sản phẩm không thay đổi.
- **Đề xuất xử lý:**
  - *Giải pháp ngắn hạn:* Ẩn phần filter subcategory ở sidebar nếu backend chưa có cột này.
  - *Giải pháp dài hạn:* Bổ sung cột `sub_category` trong entity `Product` ở Backend Spring Boot nếu muốn duy trì tính năng lọc chi tiết theo món.

---

### 🚨 LỖI 6: Thiếu bảo vệ các trang riêng tư (Private Route Guard)
- **Vị trí:** File `middleware.ts` đã bị xóa.
- **Hiện tượng:** Các trang nhạy cảm yêu cầu đăng nhập như `/account`, `/checkout`, `/cart` không có lớp kiểm tra xác thực ở Edge/Server.
- **Hệ quả:** Nếu người dùng chưa đăng nhập tự gõ thẳng URL `http://localhost:3000/account` hoặc `http://localhost:3000/checkout`, trang sẽ render một lúc rồi hiện lỗi hoặc trống dữ liệu thay vì tự động chuyển hướng người dùng về `/login-page`.
- **Đề xuất xử lý:**
  Thêm Auth Guard ở cấp Client Component (`useEffect` kiểm tra `if (!loading && !isAuthenticated) router.push('/login-page')`) trong các trang này, hoặc tạo lại file `middleware.ts` gọn nhẹ.

---

## 🛠️ PHẦN 5: BẢNG KẾ HOẠCH HÀNH ĐỘNG (ACTION PLAN)

| Thứ tự | Mức độ | Hành động cụ thể | File tác động | Dự kiến kết quả |
| :---: | :---: | :--- | :--- | :--- |
| **1** | **P0 (Khẩn cấp)** | Tạo API Proxy Route cho Blog | `app/api/blogs/route.ts`<br>`app/api/blogs/[id]/route.ts` | Khắc phục triệt để lỗi 404 khi truy cập trang Blog và chi tiết Blog |
| **2** | **P0 (Khẩn cấp)** | Sửa fallback URL thiếu `/api` | `app/api/orders/[id]/route.ts` | Tránh lỗi 404 khi gọi chi tiết đơn hàng hoặc hủy đơn |
| **3** | **P0 (Khẩn cấp)** | Sửa điều kiện kích hoạt giỏ hàng | `hooks/useCartQuery.ts`<br>`app/cart/page.tsx`<br>`app/checkout/page.tsx` | Chấm dứt spam request lỗi 401 khi khách vãng lai truy cập web |
| **4** | **P1 (Quan trọng)** | Xóa 4 file/folder rỗng & dead code | `app/api/proxy/`<br>`app/order/`<br>`app/api/checkout/route.ts`<br>`app/payment/checkout/page.tsx` | Làm sạch mã nguồn, tránh import nhầm và cấu trúc dự án chuẩn chỉ |
| **5** | **P1 (Quan trọng)** | Tách riêng API Proxy Route cho Address | `app/api/users/addresses/route.ts` | Tách bạch giữa User Profile ID và Địa chỉ giao hàng |
| **6** | **P1 (Quan trọng)** | Thêm Guard redirect cho trang riêng tư | `app/account/page.tsx`<br>`app/checkout/page.tsx` | Tự động chuyển về `/login-page` khi chưa đăng nhập |
| **7** | **P2 (Tối ưu)** | Chuẩn hóa toàn bộ Type của Product về 1 nơi | `types/product.ts`<br>`service/ProductService.ts` | Gom `Product`, `PaginatedProductResponse` vào `types/product.ts` |
| **8** | **P2 (Tối ưu)** | Ẩn/Đồng bộ bộ lọc Subcategories | `app/components/filter_sidebar.tsx` | Khớp đúng khả năng lọc của Backend Spring Boot hiện tại |

---
*Bản kế hoạch rà soát Plan 2 này đã được lập dựa trên việc đối chiếu từng file code thực tế trong toàn bộ repository frontend.*
