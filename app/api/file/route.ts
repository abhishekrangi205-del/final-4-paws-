import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Support both url and pathname params for backwards compatibility
    const url = request.nextUrl.searchParams.get("url")
    const pathname = request.nextUrl.searchParams.get("pathname")

    if (!url && !pathname) {
      return NextResponse.json({ error: "Missing url or pathname" }, { status: 400 })
    }

    // For public blobs, redirect to the blob URL directly
    // This allows authentication check while serving public files
    if (url) {
      return NextResponse.redirect(url)
    }

    // If only pathname provided, construct URL or return error
    return NextResponse.json({ error: "Please provide the full blob URL" }, { status: 400 })
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 })
  }
}
