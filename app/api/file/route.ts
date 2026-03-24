import { type NextRequest, NextResponse } from 'next/server'
import { head } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.searchParams.get('pathname')

    if (!pathname) {
      return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
    }

    // Get the blob metadata to find the public URL
    const blob = await head(pathname)

    if (!blob) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Redirect to the actual blob URL for public blobs
    return NextResponse.redirect(blob.url)
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
