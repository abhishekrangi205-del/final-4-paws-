import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { petId: string } }
) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json([])
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { data: vaccinations, error } = await supabase
      .from("vaccination_records")
      .select("*")
      .eq("pet_id", params.petId)
      .order("date_administered", { ascending: false })
    
    if (error) {
      console.error("Error fetching vaccinations:", error)
      return NextResponse.json([])
    }
    
    return NextResponse.json(vaccinations || [])
  } catch (err) {
    console.error("Unexpected error fetching vaccinations:", err)
    return NextResponse.json([])
  }
}

export async function POST(
  request: Request,
  { params }: { params: { petId: string } }
) {
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
    
    const insertData: Record<string, unknown> = {
      pet_id: params.petId,
      vaccine_name: body.vaccine_name,
      date_administered: body.date_administered,
    }
    
    // Add optional fields
    if (body.expiration_date) insertData.expiration_date = body.expiration_date
    if (body.notes) insertData.notes = body.notes
    if (body.document_pathname) insertData.document_pathname = body.document_pathname
    if (body.document_url) insertData.document_url = body.document_url
    if (body.verified !== undefined) insertData.verified = body.verified
    
    const { data: vaccination, error } = await supabase
      .from("vaccination_records")
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error("Error creating vaccination record:", error)
      return NextResponse.json({ error: "Failed to create vaccination record" }, { status: 500 })
    }
    
    return NextResponse.json(vaccination)
  } catch (err) {
    console.error("Unexpected error creating vaccination:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { petId: string } }
) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { vaccinationId } = await request.json()
    
    const { error } = await supabase
      .from("vaccination_records")
      .delete()
      .eq("id", vaccinationId)
      .eq("pet_id", params.petId)
    
    if (error) {
      console.error("Error deleting vaccination:", error)
      return NextResponse.json({ error: "Failed to delete vaccination" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Unexpected error deleting vaccination:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
