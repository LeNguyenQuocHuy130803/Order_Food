// /**
//  * Auth Service - Centralized authentication API calls
//  */

// import apiClient from '../lib/api/api-client-advanced'

// export interface LoginCredentials {
//   email: string
//   password: string
// }

// export interface LoginResponse {
//   accessToken: string
//   id: number
//   roles: string[]
//   username: string
// }

// export interface AuthUser {
//   id: number
//   username: string
//   roles: string[]
// }

// /**
//  * Login user with username/email and password
//  */
// async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
//   // Input sanitization
//   const sanitizedCredentials = {
//     email: credentials.email.trim(),
//     password: credentials.password.trim(),
//   }

//   try {
//     // apiClient sử dụng Axios để login (logic đó ở file index trong lib -> api để lựa chọn là tự refresh token ) - trả về data trực tiếp từ response interceptor
//     // khi user nhấn login -> loginform gọi đến hook useLogin -> trong useLogin gọi đến authService.loginUser() -> authService gọi: apiClient.post('/auth/login', {...})
//     // apiclient sẽ tự động Thêm access_token vào header (nếu có) sau đó gửi request ta muốn login đên sever ( nếu token hết hạn thì sẽ tự động gọi API refresh token để lấy token mới rồi retry request login này mà không bị đá ra khỏi hệ thống, chỉ khi nào refresh token cũng hết hạn thì mới bị đá ra khỏi hệ thống)  -> sau đó nhận response trả về
//     // sau khi useLogin nhân được response trả về từ authService.loginUser() thì sẽ gọi authService.saveUserData(response) để lưu token và thông tin user vào localStorage, rồi gọi refreshUser() để cập nhật lại thông tin user trong context, cuối cùng là chuyển hướng về dashboard
//     const response: LoginResponse = await apiClient.post('/auth/login', sanitizedCredentials)
//     return response
//   } catch (error: any) {
//     const errorMessage =
//       error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác'
//     throw new Error(errorMessage)
//   }
// }

// /**
//  * Get current user info từ localStorage
//  */
// function getCurrentUser(): AuthUser | null {
//   if (typeof window === 'undefined') return null

//   const userId = localStorage.getItem('userId')
//   const username = localStorage.getItem('username')
//   const roles = localStorage.getItem('roles')

//   if (!userId || !username) return null

//   return {
//     id: parseInt(userId, 10),
//     username,
//     roles: roles ? JSON.parse(roles) : [],
//   }
// }

// /**
//  * Save user data to localStorage
//  */
// function saveUserData(data: LoginResponse): void {
//   if (typeof window === 'undefined') return

//   localStorage.setItem('accessToken', data.accessToken)
//   localStorage.setItem('userId', data.id.toString())
//   localStorage.setItem('username', data.username)
//   localStorage.setItem('roles', JSON.stringify(data.roles))
// }

// /**
//  * Logout user - clear all data
//  */
// function logout(): void {
//   if (typeof window === 'undefined') return

//   localStorage.removeItem('accessToken')
//   localStorage.removeItem('userId')
//   localStorage.removeItem('username')
//   localStorage.removeItem('roles')
// }

// /**
//  * Check if user is authenticated
//  */
// function isAuthenticated(): boolean {
//   if (typeof window === 'undefined') return false

//   return !!localStorage.getItem('accessToken')
// }

// export const authService = {
//   loginUser,
//   getCurrentUser,
//   saveUserData,
//   logout,
//   isAuthenticated,
// }
