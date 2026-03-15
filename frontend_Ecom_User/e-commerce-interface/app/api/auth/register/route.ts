/**
 * API Route: POST /api/auth/register
 * ✅ Registers a new user account
 * ✅ Calls backend /auth/register
 * ✅ Sets HTTP-only cookies with tokens
 * ✅ Returns user info to client
 */

import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function POST(req: NextRequest) {
  try {
    const { email, userName, password, phoneNumber } = await req.json()

    // ✅ Validate required fields
    if (!email || !userName || !password || !phoneNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ✅ Call backend register endpoint
    const backendRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, userName, password, phoneNumber }),
    })

    if (!backendRes.ok) {
      const error = await backendRes.json()
      return NextResponse.json(
        { message: error.message || 'Registration failed' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()

    // ✅ Create response with user info only
    const res = NextResponse.json(
      {
        user: {
          id: data.id,
          email: data.email,
          username: data.username,
          phoneNumber: data.phoneNumber,
          roles: data.roles,
        },
      },
      { status: 200 }
    )

    // ✅ Set HTTP-only cookies with tokens
    if (data.accessToken) {
      res.cookies.set('accessToken', data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600, // 1 hour
        path: '/',
      })
    }

    // ✅ Set refresh token if provided by backend
    if (data.refreshToken) {
      res.cookies.set('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600, // 7 days
        path: '/',
      })
    }

    return res
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { message: 'Registration failed: ' + error.message },
      { status: 500 }
    )
  }
}
