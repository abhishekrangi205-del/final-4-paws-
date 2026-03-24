import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

// Helper to mask sensitive tokens for logging
function maskToken(token: string | undefined): string {
  if (!token) return 'NOT_SET'
  if (token.length <= 8) return '***'
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
}

export async function POST(request: Request) {
  console.log('[v0] === VACCINE UPLOAD TEST START ===')
  
  try {
    // Check environment variable
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    console.log('[v0] BLOB_READ_WRITE_TOKEN:', maskToken(blobToken))
    
    if (!blobToken) {
      console.log('[v0] ERROR: BLOB_READ_WRITE_TOKEN is not configured')
      return NextResponse.json({ error: 'File storage not configured. Please add BLOB_READ_WRITE_TOKEN.' }, { status: 503 })
    }
    
    const formData = await request.formData()
    const fileData = formData.get('file')

    if (!(fileData instanceof File)) {
      console.log('[v0] ERROR: No valid file in request')
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 })
    }

    const file = fileData
    
    // Log file info
    console.log('[v0] File Info:')
    console.log('[v0]   - Name:', file.name)
    console.log('[v0]   - Type:', file.type)
    console.log('[v0]   - Size:', (file.size / 1024).toFixed(2), 'KB')

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      console.log('[v0] ERROR: File type not allowed:', file.type)
      return NextResponse.json({ error: 'Only PDF and image files are allowed' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      console.log('[v0] ERROR: File too large:', file.size)
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')
    const fileName = `vaccines/${Date.now()}-${sanitizedFileName}`
    console.log('[v0] Upload path:', fileName)

    const buffer = await file.arrayBuffer()
    console.log('[v0] Buffer size:', buffer.byteLength, 'bytes')

    console.log('[v0] Uploading to Vercel Blob...')
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: file.type,
      token: blobToken,
    })

    console.log('[v0] Upload successful!')
    console.log('[v0] Blob pathname:', blob.pathname)
    console.log('[v0] Blob URL:', blob.url)
    console.log('[v0] === VACCINE UPLOAD TEST COMPLETE ===')

    return NextResponse.json({
      pathname: blob.pathname,
      url: blob.url,
    })
  } catch (err) {
    console.error('[v0] ERROR uploading file:', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
