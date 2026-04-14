// // 4 file trong lib dùng để : User không bao giờ bị đá ra khỏi hệ thống nếu chỉ vì token hết hạn. nó sẽ tự gọi lại token mới bằng refresh token, nếu refresh token cũng hết hạn thì mới chuyển hướng về login. Còn nếu chỉ vì token hết hạn mà bị đá ra khỏi hệ thống thì sẽ rất tệ cho trải nghiệm người dùng, nhất là khi họ đang ở trang dashboard và có nhiều request cùng lúc. Với cách này, họ sẽ không bị gián đoạn trải nghiệm mà vẫn đảm bảo an toàn bảo mật. 
// // B1. khi token hết hạn nó sẽ tự ạo client HTTP với baseURL là server: http://localhost:8080'
// // B2 : trước khi gửi request, tự động thêm access token từ localStorage vào header Authorization: Bearer {token}
// //B3. Nếu token hết hạn, tự động gọi API /auth/refresh-token để lấy token mới từ server
// // B4 . Nếu nhận lỗi 401/403 (token hết hạn), tự động chạy refresh token, rồi gửi lại request ban đầu
// // B5. Nếu nhiều request lỗi cùng lúc, chúng đợi trong queue để refresh token chỉ 1 lần (không refresh nhiều lần vô ích)
// import Axios, { type InternalAxiosRequestConfig } from 'axios'

// // URL từ backend 
// const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// // Extend config type để hỗ trợ skipAuth
// interface AxiosConfigWithAuth extends InternalAxiosRequestConfig {
//   skipAuth?: boolean
// }

// const apiClient = Axios.create({  // mọi request sẽ dùng baseURL này
//   baseURL: URL,
//   headers: {  // đều sẽ có Content-Type là JSON
//     'Content-Type': 'application/json',
//   },
// })

// // ========================================
// // REQUEST INTERCEPTOR - Tự động gắn token vào trước khi gửi request
// // nó sẽ chặn bằng interception ở đây nếu request gửi đi nó chặn lại để ktra nó sẽ tự động gắn token ở localstorage vào header Authorization nếu có token và không bị skipAuth, còn nếu không có token hoặc bị skipAuth thì sẽ gửi request bình thường mà không gắn token vào header
// // sau bước gắn token ta sẽ có : Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// // nếu token hết hạn thì dùng refresh token để lấy token mới rồi gắn vào header Authorization rồi gửi lại request cũ mà không bị đá ra khỏi hệ thống, chỉ khi nào refresh token cũng hết hạn thì mới bị đá ra khỏi hệ thống
// // còn trươg hợp user đang ở dashboard đang call nhiều api cùng 1 lúc chả lẽ 5 mấy cái đang call api đều gọi lại fressh token cùng 1 lúc thì sẽ rất tệ cho server, nên ta sẽ dùng 1 flag isRefreshing để chỉ cho phép gọi refresh token 1 lần, các request còn lại sẽ đợi token mới được cập nhật rồi mới gửi lại request cũ mà không bị đá ra khỏi hệ thống
// // nếu có lỗi 401/403 thì sẽ tự động gọi refresh token để lấy token mới rồi gắn vào header Authorization rồi gửi lại request cũ mà không bị đá ra khỏi hệ thống, chỉ khi nào refresh token cũng hết hạn thì mới bị đá ra khỏi hệ thống, còn nếu lỗi khác thì sẽ trả về lỗi bình thường
// // Nếu là login request thì sẽ không tự động gọi refresh token mà sẽ trả về lỗi bình thường để hiển thị thông báo lỗi cho người dùng (ví dụ nhập sai mật khẩu thì sẽ không redirect về login nữa mà sẽ trả lỗi về để hiển thị thông báo lỗi cho người dùng )
// // Nếu là refresh request lỗi thì ko load lại nữa logout luôn để họ login lại 

// // ========================================
// apiClient.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const configWithAuth = config as AxiosConfigWithAuth

//     // Lấy access token từ localStorage để gắn vào header 
//     const access_token = localStorage.getItem('accessToken')

//     // nếu config.headers chưa tồn tại, khởi tạo nó để tránh lỗi khi gắn Authorization 
//     if (config.headers === undefined) {
//       config.headers = new Axios.AxiosHeaders()
//     }

//     // Gắn Authorization header nếu có token và không skip
//     if (access_token && !configWithAuth.skipAuth) {
//       config.headers.Authorization = `Bearer ${access_token}`  // Gắn token vào header nếu có và không bị skipAuth
//     }

//     config.headers.Accept = 'application/json'

//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// // ========================================
// // REFRESH TOKEN FUNCTION - Làm mới access token khi hết hạn nếu acctoken đó hết hạn thì lấy refresh token để làm mới access token, nếu refresh token cũng hết hạn thì xóa storage và chuyển hướng về login
// // ========================================
// const refreshToken = async () => {
//   try {
//     // Lấy refresh token từ localStorage
//     const refresh_token = localStorage.getItem('refreshToken')

//     if (!refresh_token) {
//       console.error('No refresh token available')
//       return null
//     }

//     // Tạo axios instance mới để tránh infinite loop từ interceptor
//     const refreshApiClient = Axios.create({
//       baseURL: URL,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })

//     // Gọi endpoint refresh token để lấy access token mới 
//     const response: any = await refreshApiClient.post('/auth/refresh-token', {
//       refreshToken: refresh_token,
//     })

//     if (!response || !response.data || !response.data.accessToken) {
//       console.error('Invalid refresh token response')
//       return null
//     }

//     // Lưu token mới
//     localStorage.setItem('accessToken', response.data.accessToken)
//     if (response.data.refreshToken) {
//       localStorage.setItem('refreshToken', response.data.refreshToken)
//     }

//     return response.data.accessToken
//   } catch (error: any) {
//     console.error('Failed to refresh token:', error)
//     // Nếu refresh token không hợp lệ (401/403), xóa storage và chuyển hướng
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       localStorage.removeItem('accessToken')
//       localStorage.removeItem('refreshToken')
//       localStorage.removeItem('userId')
//       localStorage.removeItem('username')
//       localStorage.removeItem('roles')
//       window.location.href = '/login-page'
//     }
//     return null
//   }
// }

// // ========================================
// // RESPONSE INTERCEPTOR - Xử lý error và token refresh
// // ========================================

// // Flag để tránh gọi refresh token nhiều lần cùng lúc
// // ví dụ khi đang mở trang dashboard có 5 cái đang call api cùng lúc mà token hết hạn thì sẽ chỉ gọi refresh token 1 lần, các request còn lại sẽ đợi token mới được cập nhật rồi mới    rồi nó sẽ reset lại all 
// let isRefreshing = false
// // Hàng đợi các request đang chờ token mới
// let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = []

// const processQueue = (error: any, token: string | null = null) => {
//   failedQueue.forEach(({ resolve, reject }) => {
//     if (error) {
//       reject(error)
//     } else {
//       resolve(token)
//     }
//   })

//   failedQueue = []
// }

// // Interceptor để xử lý response, nếu gặp lỗi 401/403 sẽ tự động gọi refresh token và retry request nếu có token mới, nếu không sẽ chuyển hướng về login 
// apiClient.interceptors.response.use(
//   (response) => {
//     return response.data
//   },
//   async (error) => {
//     const originalRequest = error.config

//     // Không redirect tự động cho login request khi bị lỗi
//     if (originalRequest.url === '/auth/login') {  // ví dụ nếu login bị lỗi (nhập sai mật khẩu) thì sẽ không redirect về login nữa mà sẽ trả lỗi về để hiển thị thông báo lỗi cho người dùng 
//       return Promise.reject(error)
//     }

//     // Không retry cho refresh token request nếu refresh token bị lỗi (ví dụ refresh token hết hạn) thì dùng refresh để gọi accesss token mới nếu thành công gắn token mới và load lại request cũ con nếu thất
//     // bại thì sẽ không retry nữa mà sẽ redirect về login luôn
//     if (originalRequest.url === '/auth/refresh-token') {
//       return Promise.reject(error)
//     }

//     // Kiểm tra lỗi auth (401 hoặc 403) và chưa retry
//     if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
//       if (isRefreshing) {
//         // Nếu đang refresh, thêm request vào hàng đợi
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject })
//         })
//           .then((token) => {
//             originalRequest.headers['Authorization'] = `Bearer ${token}`
//             return apiClient(originalRequest)
//           })
//           .catch((err) => {
//             return Promise.reject(err)
//           })
//       }

//       originalRequest._retry = true
//       isRefreshing = true

//       try {
//         const newAccessToken = await refreshToken()

//         if (newAccessToken) {
//           // Cập nhật header và retry request
//           apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
//           originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

//           // Xử lý các request trong hàng đợi
//           processQueue(null, newAccessToken)

//           return apiClient(originalRequest)
//         } else {
//           // Nếu refresh thất bại
//           processQueue(error, null)
//           console.error('Unable to refresh token, redirecting to login')
//           localStorage.removeItem('accessToken')
//           localStorage.removeItem('refreshToken')
//           window.location.href = '/login-page'
//           return Promise.reject(error)
//         }
//       } catch (refreshError: any) {
//         console.error('Refresh token failed:', refreshError)
//         processQueue(refreshError, null)
//         localStorage.removeItem('accessToken')
//         localStorage.removeItem('refreshToken')
//         window.location.href = '/login-page'
//         return Promise.reject(refreshError)
//       } finally {
//         isRefreshing = false
//       }
//     }

//     // Với các lỗi khác, chỉ reject
//     return Promise.reject(error)
//   }
// )

// export default apiClient
