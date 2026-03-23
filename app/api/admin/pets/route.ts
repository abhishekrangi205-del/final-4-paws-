import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const supabase = createAdminClient()
    
    if (!supabase) {
      // Return empty array if database not configured
      return NextResponse.json([])
    }
    
    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      // If table doesn't exist or relationship not found, return empty array
      if (error.message.includes("not found") || error.message.includes("does not exist") || error.message.includes("relationship")) {
        console.log("Pets table not found or relationship error, returning empty array")
        return NextResponse.json([])
      }
      console.error("Error fetching pets:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(pets || [])
  } catch (err) {
    console.error("Unexpected error fetching pets:", err)
    // Return empty array on error to keep UI functional
    return NextResponse.json([])
  }
}
