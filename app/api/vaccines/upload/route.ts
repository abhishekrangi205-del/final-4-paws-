import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const fileData = formData.get('file')

    if (!(fileData instanceof File)) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 })
    }

    const file = fileData

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

    const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')
    const fileName = `vaccines/${Date.now()}-${sanitizedFileName}`

    const buffer = await file.arrayBuffer()

    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({
      pathname: blob.pathname,
      url: blob.url,
    })
  } catch (err) {
    console.error('Error uploading file:', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
