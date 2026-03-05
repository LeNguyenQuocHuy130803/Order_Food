import { RegisterFormData } from "@/app/(auth)/register-page/register.schema"

// ✅ Interface for API request - only required fields
export interface RegisterRequest {
  email: string
  userName: string
  password: string
  phoneNumber: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function registerUser(data: RegisterRequest) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 🔒 Include cookies
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new Error(
        responseData.message || 'Registration failed'
      )
    }

    return responseData.user
  } catch (error: any) {
    throw new Error(error.message || 'Registration request failed')
  }
}
