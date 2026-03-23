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
      return NextResponse.json([])
    }
    
    const { data: vaccinations, error } = await supabase
      .from("vaccination_records")
      .select("*")
      .order("date_administered", { ascending: false })
    
    if (error) {
      console.log("Vaccinations table not found or error, returning empty array")
      return NextResponse.json([])
    }
    
    return NextResponse.json(vaccinations || [])
  } catch (err) {
    console.error("Unexpected error fetching vaccinations:", err)
    return NextResponse.json([])
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const supabase = createAdminClient()
    
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
      console.error("Error updating vaccination:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error("Unexpected error updating vaccination:", err)
    return NextResponse.json({ error: "Failed to update vaccination" }, { status: 500 })
  }
}
