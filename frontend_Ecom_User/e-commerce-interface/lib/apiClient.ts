/**
 * API Client Helper
 * Tự động include HTTP-only cookies khi gọi API
 * Sử dụng cho tất cả requests cần authentication
 */

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options

  // ✅ Tự động include credentials (cookies)
  const finalOptions: RequestInit = {
    ...fetchOptions,
    credentials: 'include', // 🔒 Browser sẽ tự gửi HTTP-only cookies
  }

  // Set default headers
  if (!finalOptions.headers) {
    finalOptions.headers = {}
  }

  const headersObj = finalOptions.headers as Record<string, string>
  if (!headersObj['Content-Type'] && finalOptions.method !== 'GET') {
    headersObj['Content-Type'] = 'application/json'
  }

  try {
    console.log(`🔗 [apiClient] ${finalOptions.method || 'GET'} ${url}`)
    
    const response = await fetch(url, finalOptions)

    console.log(`📡 [apiClient] Status: ${response.status}`)

    // ✅ Handle 401 - token expired
    if (response.status === 401) {
      console.warn('⚠️ [apiClient] Token expired (401)')
      // Refresh token logic có thể thêm ở đây
      // Hoặc redirect về login
    }

    return response
  } catch (error: any) {
    console.error(`❌ [apiClient] Error:`, error.message)
    throw error
  }
}

/**
 * GET request
 */
export async function apiGet(url: string) {
  const response = await apiFetch(url, { method: 'GET' })
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status}`)
  return response.json()
}

/**
 * POST request
 */
export async function apiPost(url: string, data: any) {
  const response = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`POST ${url} failed: ${response.status}`)
  return response.json()
}

/**
 * PUT request
 */
export async function apiPut(url: string, data: any) {
  const response = await apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`PUT ${url} failed: ${response.status}`)
  return response.json()
}

/**
 * DELETE request
 */
export async function apiDelete(url: string) {
  const response = await apiFetch(url, { method: 'DELETE' })
  if (!response.ok) throw new Error(`DELETE ${url} failed: ${response.status}`)
  return response.json()
}

export default {
  fetch: apiFetch,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
}
