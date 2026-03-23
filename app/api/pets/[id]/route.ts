import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    // Fetch pet without relationship join
    const { data: pet, error } = await supabase
      .from("pets")
      .select("*")
      .eq("id", id)
      .single()
    
    if (error) {
      console.error("Error fetching pet:", error)
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }
    
    return NextResponse.json(pet)
  } catch (err) {
    console.error("Unexpected error in GET /api/pets/[id]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    const body = await request.json()
    
    // Build update data with only valid fields
    const updateData: Record<string, unknown> = {}
    
    const allowedFields = [
      'name', 'breed', 'size', 'gender', 'weight_lbs',
      'spayed_neutered', 'medical_notes', 'special_instructions',
      'emergency_contact_name', 'emergency_contact_phone',
      'vet_name', 'vet_phone', 'profile_image_url',
      'age_years', 'age_months'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })
    
    const { data: pet, error } = await supabase
      .from("pets")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating pet:", error)
      return NextResponse.json({ error: "Failed to update pet" }, { status: 500 })
    }
    
    return NextResponse.json(pet)
  } catch (err) {
    console.error("Unexpected error in PATCH /api/pets/[id]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("id", id)
    
    if (error) {
      console.error("Error deleting pet:", error)
      return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Unexpected error in DELETE /api/pets/[id]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
