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
    
    const { data: pets, error } = await supabase
      .from("pets")
      .select(`
        *,
        vaccination_records (*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching pets:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(pets || [])
  } catch (err) {
    console.error("Unexpected error fetching pets:", err)
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
  }
}
