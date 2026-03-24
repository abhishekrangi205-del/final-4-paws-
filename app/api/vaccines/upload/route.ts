import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // ✅ Initialize Supabase (SERVER SIDE)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookies().get(name)?.value,
        },
      }
    )

    // ✅ Check user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 👉 Your existing logic
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and image files are allowed' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const sanitizedFileName = file.name
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '')

    const fileName = `vaccines/${Date.now()}-${sanitizedFileName}`

    const blob = await put(fileName, file, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Return pathname for private blob
    return NextResponse.json({
      pathname: blob.pathname,
      url: `/api/file?pathname=${encodeURIComponent(blob.pathname)}`,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
