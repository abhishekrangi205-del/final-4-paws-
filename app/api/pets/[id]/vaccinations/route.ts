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
    
    const { data: vaccinations, error } = await supabase
      .from("vaccination_records")
      .select("*")
      .eq("pet_id", petId)
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error("Error fetching vaccinations:", error)
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
