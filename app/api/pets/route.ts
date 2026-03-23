import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json([])
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching pets:", error)
      // Return empty array if table doesn't exist
      if (error.code === "PGRST205" || error.message.includes("does not exist") || error.message.includes("not found")) {
        return NextResponse.json([])
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(pets || [])
  } catch (err) {
    console.error("Unexpected error in GET /api/pets:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    
    // Remove age_months from the insert as it may not exist in schema
    const { age_months, ...petData } = body
    
    const { data: pet, error } = await supabase
      .from("pets")
      .insert({
        ...petData,
        user_id: user.id,
        age_years: age_months ? Math.floor(age_months / 12) : null,
      })
      .select()
      .single()
    
    if (error) {
      console.error("Error creating pet:", error)
      // Return friendly error for missing column
      if (error.message.includes("age_months")) {
        return NextResponse.json({ error: "Database schema mismatch. Please contact support." }, { status: 500 })
      }
      if (error.code === "PGRST205" || error.message.includes("does not exist")) {
        return NextResponse.json({ error: "The pets table has not been created yet." }, { status: 500 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(pet)
  } catch (err) {
    console.error("Unexpected error in POST /api/pets:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
