import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Helper to mask sensitive data for logging
function maskId(id: string | undefined): string {
  if (!id) return 'NOT_SET'
  if (id.length <= 8) return '***'
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`
}

export async function GET() {
  console.log('[v0] === PETS GET TEST START ===')
  
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      console.log('[v0] ERROR: Supabase client not configured')
      return NextResponse.json([])
    }
    console.log('[v0] Supabase client initialized')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('[v0] Auth error:', authError.message)
    }
    
    if (!user) {
      console.log('[v0] No authenticated user found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Log user info (masked for security)
    console.log('[v0] Authenticated User:')
    console.log('[v0]   - ID:', maskId(user.id))
    console.log('[v0]   - Email:', user.email ? `${user.email.substring(0, 3)}...@...` : 'N/A')
    console.log('[v0]   - Created:', user.created_at)
    
    // Fetch pets - just get all data from pets table
    console.log('[v0] Fetching pets from database...')
    const { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.log('[v0] ERROR fetching pets:', error.message)
      return NextResponse.json([])
    }
    
    console.log('[v0] Pets found:', pets?.length || 0)
    console.log('[v0] === PETS GET TEST COMPLETE ===')
    
    return NextResponse.json(pets || [])
  } catch (err) {
    console.error("[v0] Unexpected error in GET /api/pets:", err)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  console.log('[v0] === PETS POST TEST START ===')
  
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      console.log('[v0] ERROR: Supabase client not configured')
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    console.log('[v0] Supabase client initialized')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('[v0] Auth error:', authError.message)
    }
    
    if (!user) {
      console.log('[v0] No authenticated user found')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log('[v0] Authenticated User ID:', maskId(user.id))
    
    const body = await request.json()
    console.log('[v0] Request body received:')
    console.log('[v0]   - Name:', body.name)
    console.log('[v0]   - Breed:', body.breed || 'N/A')
    console.log('[v0]   - Size:', body.size || 'N/A')
    
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
    
    console.log('[v0] Insert data fields:', Object.keys(insertData).join(', '))
    console.log('[v0] Inserting pet into database...')
    
    const { data: pet, error } = await supabase
      .from("pets")
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.log('[v0] ERROR creating pet:', error.message)
      console.log('[v0] Error code:', error.code)
      return NextResponse.json({ error: "Failed to create pet" }, { status: 500 })
    }
    
    console.log('[v0] Pet created successfully!')
    console.log('[v0] Pet ID:', maskId(pet.id))
    console.log('[v0] === PETS POST TEST COMPLETE ===')
    
    return NextResponse.json(pet)
  } catch (err) {
    console.error("[v0] Unexpected error in POST /api/pets:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
