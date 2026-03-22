import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: petId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Verify pet belongs to user
  const { data: pet } = await supabase
    .from("pets")
    .select("id")
    .eq("id", petId)
    .eq("user_id", user.id)
    .single()
  
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 })
  }
  
  const body = await request.json()
  
  const { data: vaccination, error } = await supabase
    .from("vaccination_records")
    .insert({
      ...body,
      pet_id: petId,
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(vaccination)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: petId } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const vaccinationId = searchParams.get("vaccinationId")
  
  if (!vaccinationId) {
    return NextResponse.json({ error: "Vaccination ID required" }, { status: 400 })
  }
  
  // Verify pet belongs to user
  const { data: pet } = await supabase
    .from("pets")
    .select("id")
    .eq("id", petId)
    .eq("user_id", user.id)
    .single()
  
  if (!pet) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 })
  }
  
  const { error } = await supabase
    .from("vaccination_records")
    .delete()
    .eq("id", vaccinationId)
    .eq("pet_id", petId)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
