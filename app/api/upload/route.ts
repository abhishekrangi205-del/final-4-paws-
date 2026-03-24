import { put } from "@vercel/blob"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Helper to mask tokens for logging
function maskToken(token: string | undefined): string {
  if (!token) return "NOT_SET"
  if (token.length <= 8) return "***"
  return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
}

export async function POST(request: NextRequest) {
  console.log("[v0] === UPLOAD API START ===")
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log("[v0] ERROR: No authenticated user")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  console.log("[v0] User authenticated:", user.id.substring(0, 8) + "...")
  
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = (formData.get("type") as string) || "general" // "profile", "vaccination", or "general"
    const petId = formData.get("petId") as string

    console.log("[v0] Upload type:", type)
    console.log("[v0] Pet ID:", petId || "none")

    if (!file) {
      console.log("[v0] ERROR: No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Log file details
    console.log("[v0] File info:")
    console.log("[v0]   - Name:", file.name)
    console.log("[v0]   - Type:", file.type)
    console.log("[v0]   - Size:", (file.size / 1024).toFixed(2), "KB")

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      console.log("[v0] ERROR: Invalid file type:", file.type)
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, WEBP, PDF allowed." }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log("[v0] ERROR: File too large:", file.size)
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Use the default BLOB_READ_WRITE_TOKEN from Vercel Blob integration
    const defaultToken = process.env.BLOB_READ_WRITE_TOKEN
    const token = defaultToken

    console.log("[v0] BLOB_READ_WRITE_TOKEN:", maskToken(defaultToken))
    console.log("[v0] Using token:", defaultToken ? "DEFAULT" : "NOT_SET")

    if (!token) {
      console.log("[v0] ERROR: No blob token configured")
      return NextResponse.json({ error: "File storage not configured" }, { status: 503 })
    }

    // Create folder path based on type
    let folder: string
    if (type === "vaccination") {
      folder = petId ? `vaccinations/${user.id}/${petId}` : `vaccinations/${user.id}`
    } else if (type === "profile") {
      folder = petId ? `profiles/${user.id}/${petId}` : `profiles/${user.id}`
    } else {
      folder = `uploads/${user.id}`
    }

    // Sanitize filename
    const sanitizedName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.-]/g, "")
    const filename = `${folder}/${Date.now()}-${sanitizedName}`
    
    console.log("[v0] Upload path:", filename)

    console.log("[v0] Uploading to Vercel Blob (public store)...")
    const blob = await put(filename, file, {
      access: "public",
      token: token,
    })

    console.log("[v0] Upload successful!")
    console.log("[v0] Blob pathname:", blob.pathname)
    console.log("[v0] === UPLOAD API COMPLETE ===")

    // Return pathname for public blob - can be accessed directly
    return NextResponse.json({ 
      pathname: blob.pathname,
      url: blob.publicUrl,
      contentType: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
