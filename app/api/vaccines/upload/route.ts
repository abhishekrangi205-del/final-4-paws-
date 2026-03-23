import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Check file type - allow PDF and image files
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PDF and image files are allowed' }, { status: 400 })
    }
    
    // Check file size - max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }
    
    // Upload to Blob
    const buffer = await file.arrayBuffer()
    const fileName = `vaccines/${Date.now()}-${file.name}`
    
    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: file.type,
    })
    
    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (err) {
    console.error('Error uploading file:', err)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
