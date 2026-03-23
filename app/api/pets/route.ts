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
    
    // Fetch pets - just get all data from pets table
    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching pets:", error)
      return NextResponse.json([])
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
    
    // Start with basic fields that should always exist
    const insertData: Record<string, unknown> = {
      name: body.name,
    }
    
    // Add optional fields if they're provided
    const optionalFields = [
      'breed', 'size', 'gender', 'weight_lbs',
      'spayed_neutered', 'medical_notes', 'special_instructions',
      'emergency_contact_name', 'emergency_contact_phone',
      'vet_name', 'vet_phone', 'profile_image_url',
      'age_years', 'age_months'
    ]
    
    optionalFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
        insertData[field] = body[field]
      }
    })
    
    const { data: pet, error } = await supabase
      .from("pets")
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error("Error creating pet:", error)
      return NextResponse.json({ error: "Failed to create pet" }, { status: 500 })
    }
    
    return NextResponse.json(pet)
  } catch (err) {
    console.error("Unexpected error in POST /api/pets:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
