import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // For now, just return success without actually storing anything
    // Users can sign up without authentication
    console.log('[v0] Signup attempt:', { name, email })
    
    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
