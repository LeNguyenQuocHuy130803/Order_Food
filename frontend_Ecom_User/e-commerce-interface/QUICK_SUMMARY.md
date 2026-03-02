# 📋 Tóm Tắt Cơ Bản - Fix Lỗi Form Reset

## ✅ Vấn Đề Đã Sửa

**Lỗi**: Khi nhập sai thông tin trong form login/register, bấm nút submit → toàn bộ dữ liệu input bị xóa hết, phải nhập lại từ đầu

**Nguyên nhân Root**: Form bị reset không cần thiết khi API trả về error validation

**Giải pháp**: 
1. Chuyển từ **Fetch API** → **Axios** (HTTP client)
2. Cải thiện error handling → giữ form data khi có lỗi
3. Thêm token refresh tự động (opcional)

---

## 📦 3 File Code Mới

### File 1: `lib/api/api-client-advanced.ts` ⭐ 
**Kích thước**: ~200 dòng  
**Chức năng**: API client nâng cao với token refresh  
**Khi nào dùng**: Production (ứng dụng thực tế)

```typescript
import apiClient from '@/lib/api/api-client-advanced'

// Sử dụng như Axios
const response = await apiClient.post('/auth/login', credentials)
```

**Tính năng**:
- ✅ Token refresh tự động
- ✅ Xử lý race condition (hàng đợi request)
- ✅ Giữ form data khi error
- ✅ Smart error handling

---

### File 2: `lib/api/api-client-simple.ts`
**Kích thước**: ~70 dòng  
**Chức năng**: API client cơ bản  
**Khi nào dùng**: Development/Testing (đơn giản)

```typescript
import apiClient from '@/lib/api/api-client-simple'

// Cách dùng giống advanced
const response = await apiClient.post('/auth/login', credentials)
```

**Tính năng**:
- ✅ Giữ form data khi error
- ❌ Không có token refresh
- ✅ Nhẹ và nhanh

---

### File 3: `lib/api/index.ts`
**Kích thước**: ~10 dòng  
**Chức năng**: Chọn advanced hoặc simple

```typescript
const mode: 'simple' | 'advanced' = 'advanced'
const apiClient = mode === 'advanced' ? apiClientAdvanced : apiClientSimple
export default apiClient
```

**Cách đổi mode**:
```typescript
// Dùng advanced (production)
const mode: 'simple' | 'advanced' = 'advanced' 

// Dùng simple (development)
const mode: 'simple' | 'advanced' = 'simple'
```

---

## 🔄 Files Đã Cập Nhật (App Logic)

### `service/authService.ts`
**Thay đổi**:
- Import từ `api-client-advanced` thay vì `apiClient`
- Sử dụng `.post()` method của Axios thay vì Fetch API
- Error handling cải thiện

**Trước**:
```typescript
const response = await apiClient('/auth/login', {
  method: 'POST', 
  body: JSON.stringify(credentials),
  skipAuth: true
})
return response.json()
```

**Sau**:
```typescript
const response = await apiClient.post('/auth/login', credentials)
return response
```

---

### `hooks/useRegister.ts`
**Thay đổi**:
- Import từ `api-client-advanced`
- Xử lý Axios response thay vì Fetch API
- Giữ nguyên logic hiển thị error

---

### `lib/api/apiClient.ts` (cũ)
**Thay đổi**: Chuyển thành file wrapper trỏ tới `api-client-advanced`

---

## 🌐 Cấu Hình Backend URL

**File**: `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

✅ Đã có sẵn trong project  
🔧 Thay `localhost:8080` nếu backend chạy ở port khác

---

## 📊 So Sánh Trước & Sau

| Điểm | Trước (Fetch API) | Sau (Axios) |
|------|-----------------|------------|
| Giữ form data khi error | ❌ Reset | ✅ Giữ lại |
| Token handling | Thủ công | Tự động |
| Token refresh | ❌ Không | ✅ Có |
| Error messages | Generic | Chi tiết |
| Code đơn giản | ✅ | ⚠️ (advanced) |

---

## 🎯 Điều Sẽ Thay Đổi Khi Dùng

### Trước: Form bị reset khi error
```
User nhập: email="test@example.com", password="123"
↓
Form validation: Error "Passwords do not match" 
↓
Bấm submit
↓
❌ Form reset, input trống
↓
User phải nhập lại từ đầu
```

### Sau: Form giữ data khi error  
```
User nhập: email="test@example.com", password="123"
↓
Form validation: Error "Passwords do not match"
↓
Bấm submit  
↓
✅ Form data GIỮ LẠI
✅ Error message hiển thị tại top
↓
User chỉ cần sửa password field, không nhập lại email
```

---

## ✨ Lợi Ích Chính

1. **Trải nghiệm user tốt hơn** - Không mất dữ liệu đã nhập
2. **Code clean hơn** - Dùng Axios thay vì Fetch API
3. **Production-ready** - Advanced mode support token refresh
4. **Dễ bảo trì** - Centralized HTTP handling

---

## 🚀 Cách Kiểm Tra

### Test 1: Login với sai password
```bash
1. Mở login page
2. Nhập username: "test123"
3. Nhập password: "123456"
4. Bấm Sign In
5. ✅ Kết quả: Username còn lại, error message hiển thị
```

### Test 2: Register với sai số điện thoại
```bash
1. Mở register page
2. Nhập email: "test@example.com"
3. Nhập username: "testuser"
4. Nhập password: "Test@123"
5. Nhập số điện thoại: "123" (sai)
6. Bấm Sign Up
7. ✅ Kết quả: Các field khác giữ lại, chỉ error về phone number
```

---

## 📚 Tài Liệu Chi Tiết

Xem file: [API_CLIENT_EXPLANATION.md](./API_CLIENT_EXPLANATION.md)

Trong đó có:
- ✅ Giải thích từng phần của code
- ✅ So sánh advanced vs simple
- ✅ Flow xử lý error
- ✅ Cách sử dụng skipAuth
- ✅ Error handling patterns

---

## 💡 Mẹo

### Muốn dùng simple mode để test nhanh?
```typescript
// Trong lib/api/index.ts
const mode: 'simple' | 'advanced' = 'simple'  // Thay đổi ở đây
```

### Muốn log tất cả API requests?
```typescript
// Thêm vào api-client-advanced.ts sau response interceptor
console.log('API Request:', originalRequest.url)
console.log('API Response:', response)
```

### Kiểm tra token hiện tại?
```typescript
// Trong browser console
localStorage.getItem('accessToken')
```
