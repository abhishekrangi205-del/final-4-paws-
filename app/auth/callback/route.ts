import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?error=${encodeURIComponent(errorDescription || error)}`
    )
  }

  if (code) {
    try {
      const supabase = await createClient()
      if (!supabase) {
        return NextResponse.redirect(`${origin}/auth/error?error=Database+not+configured`)
      }
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (!exchangeError) {
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
    } catch {
      // Fall through to error redirect
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
