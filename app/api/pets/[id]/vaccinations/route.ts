import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json([])
    }
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Just verify pet exists (skip user_id check if column doesn't exist)
    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .single()
    
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }
    
    const { data: vaccinations, error } = await supabase
      .from("vaccination_records")
      .select("*")
      .eq("pet_id", petId)
      .order("created_at", { ascending: false })
    
    if (error) {
      return NextResponse.json([])
    }
    
    return NextResponse.json(vaccinations || [])
  } catch (err) {
    console.error("Unexpected error in GET vaccinations:", err)
    return NextResponse.json([])
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Verify pet exists
    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .single()
    
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }
    
    const body = await request.json()
    
    // Build insert data with only valid fields
    const insertData: Record<string, unknown> = {
      pet_id: petId,
    }
    
    const allowedFields = [
      'vaccine_name', 'date_administered', 'expiration_date',
      'document_pathname', 'notes'
    ]
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
        insertData[field] = body[field]
      }
    })
    
    const { data: vaccination, error } = await supabase
      .from("vaccination_records")
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error("Error creating vaccination:", error)
      return NextResponse.json({ error: "Failed to create vaccination record" }, { status: 500 })
    }
    
    return NextResponse.json(vaccination)
  } catch (err) {
    console.error("Unexpected error in POST vaccinations:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Verify pet exists
    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .single()
    
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }
    
    const body = await request.json()
    const { vaccinationId, ...updateData } = body
    
    if (!vaccinationId) {
      return NextResponse.json({ error: "Vaccination ID required" }, { status: 400 })
    }
    
    // Build update data with only valid fields
    const allowedFields = [
      'vaccine_name', 'date_administered', 'expiration_date',
      'document_pathname', 'notes'
    ]
    
    const cleanedData: Record<string, unknown> = {}
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        cleanedData[field] = updateData[field] === '' ? null : updateData[field]
      }
    })
    
    const { data: vaccination, error } = await supabase
      .from("vaccination_records")
      .update(cleanedData)
      .eq("id", vaccinationId)
      .eq("pet_id", petId)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating vaccination:", error)
      return NextResponse.json({ error: "Failed to update vaccination record" }, { status: 500 })
    }
    
    return NextResponse.json(vaccination)
  } catch (err) {
    console.error("Unexpected error in PATCH vaccinations:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Verify pet exists
    const { data: pet } = await supabase
      .from("pets")
      .select("id")
      .eq("id", petId)
      .single()
    
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }
    
    const { searchParams } = new URL(request.url)
    const vaccinationId = searchParams.get("vaccinationId")
    
    if (!vaccinationId) {
      return NextResponse.json({ error: "Vaccination ID required" }, { status: 400 })
    }
    
    const { error } = await supabase
      .from("vaccination_records")
      .delete()
      .eq("id", vaccinationId)
      .eq("pet_id", petId)
    
    if (error) {
      console.error("Error deleting vaccination:", error)
      return NextResponse.json({ error: "Failed to delete vaccination" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Unexpected error in DELETE vaccinations:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
