import { NextResponse } from 'next/server'

/**
 * API Route: POST /api/auth/logout
 * ✅ Clears HTTP-only cookies
 * ✅ Logs user out
 */

export async function POST() {
  try {
    console.log('🚪 [logout] Clearing cookies...')

    const res = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    // ✅ Delete HTTP-only cookies triệt để với path: '/'
    res.cookies.set('accessToken', '', { maxAge: 0, path: '/' })
    res.cookies.set('refreshToken', '', { maxAge: 0, path: '/' })
    res.cookies.delete('accessToken')
    res.cookies.delete('refreshToken')

    console.log('✅ [logout] Cookies cleared')

    return res
  } catch (error: unknown) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Logout failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
