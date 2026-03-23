import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get the file from the form data
    const formData = await request.formData()
    const fileData = formData.get('file')

    if (!(fileData instanceof File)) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 })
    }

    const file = fileData

    // Validate allowed file types
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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    // Sanitize file name
    const sanitizedFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '')
    const fileName = `vaccines/${Date.now()}-${sanitizedFileName}`

    // Upload to Vercel Blob using token
    const buffer = await file.arrayBuffer()
    const blob = await put(fileName, buffer, {
      access: 'private', // change to 'public' if needed
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Return uploaded file info
    return NextResponse.json({
      pathname: blob.pathname,
    })
  } catch (err) {
    console.error('Error uploading file:', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}