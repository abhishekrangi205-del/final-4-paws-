import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { list } from "@vercel/blob"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const petIdParam = request.nextUrl.searchParams.get("petId")

    // Build the prefix for listing files
    let prefix = `vaccinations/${user.id}`
    if (petIdParam) {
      prefix = `vaccinations/${user.id}/${petIdParam}`
    }

    // List all vaccination files for this user (or pet)
    const { blobs } = await list({
      prefix,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Parse blob information
    const vaccinations = blobs.map(blob => {
      // Extract info from pathname: vaccinations/userId/petId/timestamp-filename
      const parts = blob.pathname.split("/")
      const filename = parts[parts.length - 1]
      const [timestamp, ...nameParts] = filename.split("-")
      
      const petId = parts.length > 3 ? parts[2] : "unknown"
      
      return {
        id: blob.pathname,
        pathname: blob.pathname,
        url: `/api/file?pathname=${encodeURIComponent(blob.pathname)}`,
        fileName: filename,
        petId,
        uploadedAt: blob.uploadedAt,
        size: blob.size,
      }
    })

    return NextResponse.json(vaccinations)
  } catch (error) {
    console.error("[v0] Error listing vaccinations:", error)
    return NextResponse.json({ error: "Failed to list vaccinations" }, { status: 500 })
  }
}
