import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    const { vaccinationId, verified } = await request.json()
    
    const { data, error } = await supabase
      .from("vaccination_records")
      .update({
        verified,
        verified_by: verified ? "admin" : null,
        verified_at: verified ? new Date().toISOString() : null,
      })
      .eq("id", vaccinationId)
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error("Unexpected error updating vaccination:", err)
    return NextResponse.json({ error: "Failed to update vaccination" }, { status: 500 })
  }
}
