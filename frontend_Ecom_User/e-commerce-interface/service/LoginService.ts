/**
 * Login Service
 * ✅ Handles user login logic (alternative to signIn)
 * ✅ Calls /api/auth/login endpoint
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number
    username: string
    email: string
    roles: string[]
  }
}

/**
 * Login user with email and password
 * @param data - Login request data
 * @returns User data after successful login
 * @throws Error if login fails
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse['user']> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 🔒 Include cookies
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(responseData.message || 'Login failed')
    }

    return responseData.user
  } catch (error: any) {
    throw new Error(error.message || 'Login request failed')
  }
}
