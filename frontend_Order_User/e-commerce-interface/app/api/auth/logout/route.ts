import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: POST /api/auth/logout
 * ✅ Clears HTTP-only cookies
 * ✅ Logs user out
 */

export async function POST(req: NextRequest) {
  try {
    console.log('🚪 [logout] Clearing cookies...')

    const res = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    // ✅ Delete HTTP-only cookies
    res.cookies.delete('accessToken')
    res.cookies.delete('refreshToken')

    console.log('✅ [logout] Cookies cleared')

    return res
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Logout failed: ' + error.message },
      { status: 500 }
    )
  }
}
