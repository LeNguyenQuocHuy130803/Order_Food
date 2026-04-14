# React TanStack Query (React Query) - Hướng dẫn Edit User chi tiết

## 📌 Mục lục
1. [Overview](#overview)
2. [Tại sao React Query](#tại-sao-react-query)
3. [Cách hoạt động](#cách-hoạt-động)
4. [File Structure](#file-structure)
5. [Chi tiết từng phần](#chi-tiết-từng-phần)
6. [Xử lý Errors](#xử-lý-errors)
7. [Optimistic Updates](#optimistic-updates)
8. [Image Cache Busting (Avatar)](#image-cache-busting-avatar) ⭐
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**React Query (hay TanStack Query v5)** là library quản lý **server state** tự động. Thay vì dùng nhiều `useState` hooks, bạn dùng React Query để:
- ✅ Auto-fetch data từ API
- ✅ Auto-cache & reuse data
- ✅ Auto-invalidate cache khi update
- ✅ Auto-refetch khi needed
- ✅ Auto-handle loading/error states

---

## Tại sao React Query?

### ❌ Cách cũ (useState + useEffect)
```typescript
const [profile, setProfile] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  fetchUser(id)
    .then(data => setProfile(data))
    .catch(err => setError(err))
    .finally(() => setLoading(false))
}, [id])

// Vấn đề:
// ❌ Phải quản lý 3 state khác nhau
// ❌ Dễ quên invalidate cache
// ❌ Cách handle loading/error bị repeat
// ❌ Khó cache data
// ❌ Race condition nếu update request trước request fetch xong
```

### ✅ Cách React Query
```typescript
const { data: profile, isLoading, error } = useUserDetail(id)

// Lợi ích:
// ✅ 1 hook handle tất cả
// ✅ Auto-cache 5 phút
// ✅ Auto-invalidate on mutation
// ✅ Type-safe
// ✅ DevTools debug
// ✅ No race conditions
```

---

## Cách hoạt động

### 🔄 Flow khi Edit User

```
1. Component mount
   ↓
2. useUserDetail(userId) trigger
   ↓
3. Query server dengan queryKey = ['user', userId]
   ↓
4. Dữ liệu về → cache vào memory
   ↓
5. Hiển thị form với profile data
   ↓
6. User click "Save"
   ↓
7. useUpdateUserMutation trigger
   ↓
8. FormData gửi qua API
   ↓
9. onSuccess callback:
   - Cập nhật cache ngay
   - Invalidate query (tự động refetch)
   ↓
10. UI re-render với data mới
```

### 📊 Cache Timeline

```
Time 0s:    User opens page
            → Query fetch data from API
            ↓
Time 1s:    Data arrives → Save to cache (memory)
            ↓
Time 1-5m:  Any component using useUserDetail(userId)
            → Get data from cache (instant, no API call)
            ↓
Time 5m:    Data become "stale"
            → Next time needed → refetch automatically
            ↓
Time 10m:   Data garbage collect (remove from memory)
            (nếu không component nào dùng)
```

---

## File Structure

```
app/
├── account/
│   ├── page.tsx                 ← Main page component
│   ├── ProfileEditForm.tsx      ← Form component (react-hook-form)
│   └── error.tsx                ← Error boundary
│
lib/
├── api/
│   └── queries.ts               ← React Query hooks
├── apiClient.ts                 ← Axios instance
└── ...

service/
└── userService.ts               ← API calls (axios)

types/
└── user.ts                       ← TypeScript types
```

---

## Chi tiết từng phần

### 1️⃣ Service Layer (`service/userService.ts`)

```typescript
import apiClient from '@/lib/apiClient'
import type { UserDetail } from '@/types/user'

/**
 * Service chỉ chịu trách nhiệm:
 * - Gọi API endpoints
 * - Format response data
 * - Throw errors nếu API fail
 * 
 * KHÔNG handle:
 * - Cache
 * - Loading/error state
 * - Re-request logic
 */

export const getUserById = async (userId: number): Promise<UserDetail> => {
  const res = await apiClient.get<UserDetail>(`/users/${userId}`)
  return res.data
}

export const updateUser = async (
  userId: number,
  data: Partial<UserDetail>,
  avatarFile?: File
): Promise<UserDetail> => {
  const formData = new FormData()
  
  if (data.userName) formData.append('userName', data.userName)
  if (data.email) formData.append('email', data.email)
  if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber)
  if (avatarFile) formData.append('avatar', avatarFile)

  const res = await apiClient.patch<UserDetail>(
    `/users/${userId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return res.data
}

export const userService = {
  getUserById,
  updateUser,
}
```

---

### 2️⃣ React Query Hooks (`lib/api/queries.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/service/userService'
import type { UserDetail } from '@/types/user'

/**
 * Mỗi query cần một unique key (queryKey)
 * Format best practice: ['resource', id, filter?]
 * Ví dụ:
 *   - ['user', 1]       → user with id 1
 *   - ['user', 1, 'edit'] → user 1 in edit mode
 *   - ['users']         → list of users
 *   - ['users', 'admin'] → list admin users
 */
const USER_QUERY_KEY = ['user'] as const

/**
 * FETCH HOOK: useUserDetail
 * 
 * Dùng khi: Cần fetch user data
 * 
 * Cách hoạt động:
 * 1. Lần đầu: fetch từ API
 * 2. Cache trong 5 phút
 * 3. Lần 2: dùng cache (instant)
 * 4. Sau 5 phút: data "stale", refetch nếu component re-render
 */
export const useUserDetail = (userId: number) => {
  return useQuery({
    // ✅ Query key (dùng để cache & invalidate)
    queryKey: [...USER_QUERY_KEY, userId],
    
    // ✅ Query function (fetch data)
    queryFn: () => userService.getUserById(userId),
    
    // ✅ Dữ liệu được cache bao lâu?
    // staleTime: data chưa cần update
    // gcTime (cũ: cacheTime): data chưa xóa khỏi memory
    staleTime: 5 * 60 * 1000,  // 5 phút
    gcTime: 10 * 60 * 1000,    // 10 phút
    
    // ✅ Chỉ fetch khi userId có
    enabled: !!userId,
  })
}

/**
 * MUTATION HOOK: useUpdateUserMutation
 * 
 * Dùng khi: Cần update user profile
 * 
 * Cách hoạt động:
 * 1. Gọi mutateAsync() triggered
 * 2. API request sent
 * 3. onSuccess callback → cache update + invalidate
 * 4. Component re-render với data mới
 */
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // ✅ Hàm gọi API
    mutationFn: ({
      userId,
      data,
      avatar,
    }: {
      userId: number
      data: Partial<UserDetail>
      avatar?: File
    }) => userService.updateUser(userId, data, avatar),

    // ✅ Khi update thành công
    onSuccess: (updatedUser, variables) => {
      // 1. Cập nhật cache ngay lập tức (không cần chờ refetch)
      queryClient.setQueryData(
        [...USER_QUERY_KEY, variables.userId],
        updatedUser
      )

      // 2. Invalidate query → component sẽ refetch nếu cần
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEY,
      })
    },

    // ✅ Khi error (optional)
    onError: (error: any) => {
      console.error('❌ Update failed:', error.message)
    },
  })
}
```

---

### 3️⃣ Form Component (`app/account/ProfileEditForm.tsx`)

```typescript
'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { UserDetail } from '@/types/user'

/**
 * ZOD SCHEMA: Validation rules
 * - userName: bắt buộc, min 3 ký tự
 * - email: phải là email hợp lệ
 * - phoneNumber: tùy chọn, min 10 ký tự
 */
const profileSchema = z.object({
  userName: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 10, {
      message: 'Phone must be at least 10 characters',
    }),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileEditFormProps {
  profile: UserDetail
  onSubmit: (data: ProfileFormData, avatar?: File) => Promise<void>
  isLoading?: boolean
  error?: string | null
  onCancel: () => void
}

export function ProfileEditForm({
  profile,
  onSubmit,
  isLoading = false,
  error = null,
  onCancel,
}: ProfileEditFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')

  /**
   * REACT HOOK FORM: Quản lý form state + validation
   * 
   * Lợi ích so với setState:
   * - ✅ Validation automatic
   * - ✅ Perform optimized (không re-render mỗi keystroke)
   * - ✅ Easy access to field errors
   * - ✅ Built-in form state (dirty, touched, etc)
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userName: profile.userName,
      email: profile.email,
      phoneNumber: profile.phoneNumber || '',
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        alert('File must be < 10MB')
        return
      }

      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = async (data: ProfileFormData) => {
    // Gọi parent's onSubmit
    await onSubmit(data, avatarFile || undefined)
  }

  const handleCancel = () => {
    reset()
    setAvatarFile(null)
    setAvatarPreview('')
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Username field với validation error */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Username *
        </label>
        <input
          type="text"
          {...register('userName')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter username"
          disabled={isLoading}
        />
        {errors.userName && (
          <p className="text-red-600 text-sm mt-1">⚠️ {errors.userName.message}</p>
        )}
      </div>

      {/* Email field */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Email *
        </label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter email"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">⚠️ {errors.email.message}</p>
        )}
      </div>

      {/* Submit & Cancel buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-[#ff5528] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
```

---

### 4️⃣ Page Component (`app/account/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserDetail, useUpdateUserMutation } from '@/lib/api/queries'
import { ProfileEditForm } from './ProfileEditForm'
import type { UserDetail } from '@/types/user'

export default function AccountPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  /**
   * FETCH DATA
   * 
   * Cách hoạt động:
   * 1. Component mount → trigger query
   * 2. API call → backend
   * 3. Data cache
   * 4. Render lại component
   * 
   * State names từ React Query:
   * - data: actual user profile
   * - isLoading: đang fetch (lần đầu)
   * - isFetching: đang fetch (lần n)
   * - error: any error happened
   * - status: 'pending' | 'success' | 'error'
   */
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: queryError,
  } = useUserDetail(user?.id ?? 0)

  /**
   * UPDATE DATA
   * 
   * Cách hoạt động:
   * 1. User click "Save"
   * 2. Form submit → call handleUpdateProfile
   * 3. mutateAsync() triggered
   * 4. API call → backend
   * 5. onSuccess callback:
   *    - queryClient.setQueryData (update cache)
   *    - queryClient.invalidateQueries (tell component refetch)
   * 6. Component re-render with new data
   * 
   * State names:
   * - isPending: đang gửi request
   * - isSuccess: update thành công
   * - isError: update fail
   * - error: error message
   */
  const {
    mutateAsync: updateUserMutation,
    isPending: isUpdatingProfile,
    error: updateError,
  } = useUpdateUserMutation()

  const handleUpdateProfile = async (
    formData: Partial<UserDetail>,
    avatar?: File
  ) => {
    if (!user) return

    try {
      await updateUserMutation({
        userId: user.id,
        data: formData,
        avatar,
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  // Loading state
  if (isLoadingProfile) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* Edit button */}
      <button onClick={() => setIsEditing(!isEditing)}>
        {isEditing ? 'Cancel' : 'Edit'}
      </button>

      {/* Edit form */}
      {isEditing && profile ? (
        <ProfileEditForm
          profile={profile}
          onSubmit={handleUpdateProfile}
          isLoading={isUpdatingProfile}
          error={updateError?.message}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        // Display mode
        <div>
          <p>Username: {profile?.userName}</p>
          <p>Email: {profile?.email}</p>
        </div>
      )}
    </div>
  )
}
```

---

## Xử lý Errors

### ❌ Network Error
```typescript
const { error } = useUserDetail(userId)

if (error instanceof AxiosError) {
  const statusCode = error.response?.status
  
  if (statusCode === 401) {
    // Unauthorized → redirect to login
    router.push('/login')
  } else if (statusCode === 404) {
    // Not found
    return <div>User not found</div>
  } else {
    // Server error
    return <div>Something went wrong</div>
  }
}
```

### 🔄 Retry Logic (Tự động)
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,  // Retry 3 times (exponential backoff)
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000), // max 30s
    },
  },
})
```

---

## Optimistic Updates

### ⚡ Cập nhật UI trước khi API response

```typescript
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => userService.updateUser(data),
    
    // 🎯 onMutate: Update UI ngay trước gửi request
    onMutate: async (newData) => {
      // Cancel pending requests
      await queryClient.cancelQueries({ 
        queryKey: USER_QUERY_KEY 
      })

      // Save old data để rollback nếu error
      const previousData = queryClient.getQueryData(USER_QUERY_KEY)

      // Update UI immediately (optimistic)
      queryClient.setQueryData(USER_QUERY_KEY, newData)

      return { previousData }
    },

    // 🔄 onError: Rollback nếu API fail
    onError: (err, newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(USER_QUERY_KEY, context.previousData)
      }
    },

    // ✅ onSuccess: Confirm update (API succeeded)
    onSuccess: (data) => {
      queryClient.setQueryData(USER_QUERY_KEY, data)
    },
  })
}
```

**Lợi ích:**
- User thấy UI thay đổi ngay (instant feedback)
- Nếu API fail → tự động rollback
- UX cảm giác real-time

---

## Image Cache Busting (Avatar Issue)

### 🖼️ Vấn đề: Avatar cũ được cache

**Tình huống:**
```
User update avatar mới → Backend trả về URL ảnh mới → 
React Query cache updated → Component re-render → 
NHƯNG browser cache ảnh cũ vào bộ nhớ → Vẫn hiển thị ảnh cũ!
```

**Lý do:**
- Browser caches images by URL
- Nếu URL giống nhau → Browser không fetch, dùng cache cũ
- Kể cả khi backend trả ảnh mới, URL vẫn là `/image/avatar.jpg`

### ✅ Giải pháp: Cache Busting

#### **Cách 1: Dùng Query Parameter (Đơn giản)**

```typescript
// app/account/page.tsx
const [avatarRefresh, setAvatarRefresh] = useState(0)

const handleUpdateProfile = async (formData, avatar?) => {
  try {
    await updateUserMutation({ userId: user.id, data: formData, avatar })
    // ✅ Increment counter → URL thay đổi → Browser fetch ảnh mới
    setAvatarRefresh(prev => prev + 1)
  } catch (err) {
    console.error('Update failed:', err)
  }
}

// Sidebar avatar
<Image
  key={`sidebar-avatar-${avatarRefresh}`}
  src={`${profile?.avatar || user.avatar || '/null.jpg'}?v=${avatarRefresh}`}
  alt="User Avatar"
  fill
  className="object-cover"
/>
```

**How it works:**
```
Lần 1: src="/avatar.jpg?v=0"         → URL A → Browser fetch từ server
Sau update: setAvatarRefresh(1)
Lần 2: src="/avatar.jpg?v=1"         → URL B (khác!) → Browser fetch từ server
Lần 3: setAvatarRefresh(2)
Lần 4: src="/avatar.jpg?v=2"         → URL C (khác!) → Browser fetch từ server
```

#### **Cách 2: Dùng Timestamp (Auto refresh)**

```typescript
// Không cần State, tự động force fetch ảnh
<Image
  src={`${profile?.avatar}?t=${Date.now()}`}
  alt="User Avatar"
  fill
  className="object-cover"
/>
```

**Nhược điểm:** Mỗi re-render = mỗi request (performance kém)

#### **Cách 3: Cross-component sync (Advanced)**

**Problem:** Avatar ở nhiều nơi:
1. Account page (sidebar)
2. Account page (edit form preview)
3. Header (user dropdown)

**Solution:** Dùng React Query làm "single source of truth"

```typescript
// lib/api/queries.ts
export const useUserDetail = (userId: number) => {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, userId],
    queryFn: () => userService.getUserById(userId),
    staleTime: 5 * 60 * 1000,
  })
}

// Mỗi component dùng hook này → auto sync
const { data: profile } = useUserDetail(userId)

// Image component
<Image
  src={profile?.avatar || '/null.jpg'}  // ← React Query data (always fresh)
  alt="Avatar"
/>
```

### 📋 Implementation Details

#### **Account Page (account/page.tsx)**

```typescript
const [avatarRefresh, setAvatarRefresh] = useState(0)
const { data: profile } = useUserDetail(user?.id ?? 0)

const handleUpdateProfile = async (formData, avatar?) => {
  try {
    await updateUserMutation({ userId: user.id, data: formData, avatar })
    setAvatarRefresh(prev => prev + 1)  // ← Increment cache buster
  } catch (err) {
    console.error('Update failed:', err)
  }
}

// Sidebar
<Image
  key={`sidebar-avatar-${avatarRefresh}`}
  src={`${profile?.avatar || user.avatar}?v=${avatarRefresh}`}
  alt="Avatar"
  fill
  className="object-cover"
/>
```

#### **Header (header.tsx)**

```typescript
import { useUserDetail } from "@/lib/api/queries"

export function Header() {
  const [avatarRefresh, setAvatarRefresh] = useState(0)
  const { data: profile } = useUserDetail(user?.id ?? 0)

  // ✅ Listen when user comes back from account page
  useEffect(() => {
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setAvatarRefresh(prev => prev + 1)  // ← Force refresh
      }
    })
  }, [])

  return (
    // Header avatar
    <Image
      key={`header-avatar-${avatarRefresh}`}
      src={`${profile?.avatar || user.avatar}?v=${avatarRefresh}`}
      alt="Avatar"
      fill
      className="object-cover"
    />
  )
}
```

### 🎯 Best Practices

| Practice | Why | Example |
|----------|-----|---------|
| **Dùng React Query** | Single source of truth | `const { data: profile } = useUserDetail(id)` |
| **Cache busting key** | Force re-render | `key={avatar-${refresh}}` |
| **Query param** | Browser cache bypass | `src={image?v=1}` |
| **visibilitychange listener** | Sync on tab switch | Auto increment refresh when returning |
| **Profile fallback** | Nie quên NextAuth | `profile?.avatar \|\| user.avatar` |

### ❌ Common Mistakes

```typescript
// ❌ WRONG: Sidebar dùng user.avatar (NextAuth - static)
<Image src={user.avatar} />  // Không update khi user change avatar

// ✅ CORRECT: Sidebar dùng profile?.avatar (React Query - dynamic)
<Image src={profile?.avatar || user.avatar} />

// ❌ WRONG: Không cache busting
<Image src={profile.avatar} />  // Browser cache URL

// ✅ CORRECT: Thêm cache buster
<Image src={`${profile.avatar}?v=${refreshKey}`} />

// ❌ WRONG: Reload page
window.location.reload()  // Page blink, user experience xấu

// ✅ CORRECT: Increment state
setAvatarRefresh(prev => prev + 1)  // Smooth re-render
```

---

## Best Practices

### ✅ DO

```typescript
// 1. Dùng queryKey pattern
const USER_QUERY_KEY = ['user'] as const
queryKey: [...USER_QUERY_KEY, userId]

// 2. Separate service & query layers
// service/*.ts → API calls only
// lib/api/queries.ts → React Query hooks only

// 3. Validate data with Zod
const schema = z.object({ ... })

// 4. Handle loading/error states
const { data, isLoading, error } = useQuery(...)

// 5. Invalidate cache on mutation success
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey })
}

// 6. Dùng DevTools cho debug
<ReactQueryDevtools initialIsOpen={false} />
```

### ❌ DON'T

```typescript
// ❌ Không dùng useState cho server state
const [user, setUser] = useState(null)
useEffect(() => { fetchUser().then(setUser) }, [])

// ❌ Không hardcode query keys
useQuery({ queryKey: ['user'] })

// ❌ Không handle cache manually
queryClient.setQueryData(...) // trừ onMutate callback

// ❌ Không refetch mỗi lần component re-render
useQuery({ refetchInterval: 0 }) // Mặc định: chỉ fetch lần đầu

// ❌ Không quên enabled condition
useQuery({ queryKey, queryFn, enabled: !!userId })
```

---

## Troubleshooting

### 🐛 Cache không update?
```typescript
// ❌ WRONG: Chỉ set cache, không invalidate
onSuccess: (data) => {
  queryClient.setQueryData(['user', userId], data)
}

// ✅ CORRECT: Cập nhật + invalidate
onSuccess: (data, variables) => {
  queryClient.setQueryData(['user', variables.userId], data)
  queryClient.invalidateQueries({ queryKey: ['user'] })
}
```

### 🐛 Form không reset khi cancel?
```typescript
// PhantomJS nên dùng react-hook-form's reset()
const { reset } = useForm(...)

const handleCancel = () => {
  reset() // ← Reset form values
  setIsEditing(false)
}
```

### 🐛 Ảnh cũ được cache?
```typescript
// Query key cần unique khi file upload
useQuery({
  queryKey: [...USER_QUERY_KEY, userId, fileVersion],
  // fileVersion = timestamp hoặc file hash
})
```

### 🐛 Multiple mutation loading states?
```typescript
// ✅ Dùng isPending để show loading
const { isPending, isSuccess } = useMutation(...)

// Hoặc check status
const { status } = useMutation(...)
// status = 'idle' | 'pending' | 'success' | 'error'
```

---

## Summary

| Feature | Benefit |
|---------|---------|
| **Queries** | Auto-fetch, auto-cache, auto-invalidate |
| **Mutations** | Update server state + local cache |
| **DevTools** | Debug cache, inspect network |
| **Error handling** | Retry, error boundaries, fallbacks |
| **Performance** | Memoization, deduplication, normalization |
| **DX** | TypeScript safe, less boilerplate |

**Bộ ba thần thánh 2026:**
```
React Query (server state) 
+ React Hook Form (local form state) 
+ Zod (validation)
```

= **Professional React application** ✨

