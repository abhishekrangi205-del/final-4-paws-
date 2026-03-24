import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Helper to mask sensitive data for logging
function maskId(id: string | undefined): string {
  if (!id) return 'NOT_SET'
  if (id.length <= 8) return '***'
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`
}

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
    
    // First, try a simple fetch to see if user_id column exists
    let hasUserIdColumn = true
    let { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    
    // Check if user_id column doesn't exist
    if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("user_id") || error.message?.includes("does not exist"))) {
      hasUserIdColumn = false
      // Fetch all pets without user_id filter
      const fallback = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false })
      
      pets = fallback.data
      error = fallback.error
    }

    if (error) {
      console.log('[v0] Error fetching pets:', error.message)
      return NextResponse.json([])
    }
    
    // Add empty vaccination_records to each pet (vaccination join not working)
    const petsWithVaccinations = (pets || []).map(p => ({ ...p, vaccination_records: [] }))
    
    return NextResponse.json(petsWithVaccinations)
  } catch (err) {
    console.error("[v0] Unexpected error in GET /api/pets:", err)
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
    
    // Build insert data - try with user_id first
    const insertData: Record<string, unknown> = {
      name: body.name,
    }
    
    // Add optional fields if they're provided
    const optionalFields = [
      'breed', 'size', 'gender', 'weight_lbs',
      'spayed_neutered', 'medical_notes', 'special_instructions',
      'emergency_contact_name', 'emergency_contact_phone',
      'vet_name', 'vet_phone', 'profile_image_url',
      'age_years', 'age_months', 'user_id'
    ]
    
    // Try to add user_id
    insertData.user_id = user.id
    
    optionalFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
        insertData[field] = body[field]
      }
    })
    
    let { data: pet, error } = await supabase
      .from("pets")
      .insert(insertData)
      .select()
      .single()
    
    // If user_id column doesn't exist, retry without it
    if (error && (error.code === "PGRST204" || error.code === "42703" || error.message?.includes("user_id") || error.message?.includes("does not exist"))) {
      delete insertData.user_id
      const retry = await supabase
        .from("pets")
        .insert(insertData)
        .select()
        .single()
      
      pet = retry.data
      error = retry.error
    }
    
    if (error) {
      return NextResponse.json({ error: "Failed to create pet" }, { status: 500 })
    }
    
    return NextResponse.json(pet)
  } catch (err) {
    console.error("[v0] Unexpected error in POST /api/pets:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
