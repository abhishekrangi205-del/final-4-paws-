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
      // Return empty array if table doesn't exist or has schema issues
      if (error.code === "PGRST205" || error.code === "42703" || error.message.includes("does not exist") || error.message.includes("not found")) {
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
    
    // Handle both age_months (old) and age_years (new) for compatibility
    const { age_months, age_years, ...petData } = body
    const finalAgeYears = age_years || (age_months ? Math.floor(age_months / 12) : null)
    
    const { data: pet, error } = await supabase
      .from("pets")
      .insert({
        ...petData,
        user_id: user.id,
        age_years: finalAgeYears,
        age_months: age_months || null,
      })
      .select()
      .single()
    
    if (error) {
      console.error("Error creating pet:", error)
      // Handle schema mismatch gracefully
      if (error.code === "42703" || error.message.includes("does not exist")) {
        return NextResponse.json({ error: "Database table not configured properly. Please contact support." }, { status: 500 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(pet)
  } catch (err) {
    console.error("Unexpected error in POST /api/pets:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
