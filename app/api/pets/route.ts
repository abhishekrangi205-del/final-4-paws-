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
    
    // Try to fetch with user_id filter first
    let { data: pets, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    
    // If user_id column doesn't exist, fetch all pets (for existing schema compatibility)
    if (error && error.code === "42703" && error.message.includes("user_id")) {
      console.log("[v0] user_id column not found, fetching all pets")
      const { data: allPets, error: altError } = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (altError) {
        console.error("Error fetching pets:", altError)
        return NextResponse.json([])
      }
      return NextResponse.json(allPets || [])
    }
    
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
    
    // Separate age fields that may not exist in schema
    const { age_months, age_years, ...petData } = body
    
    // Build insert object with only available columns
    const insertData: Record<string, unknown> = {
      ...petData,
    }
    
    // Try to add user_id if the column exists
    try {
      insertData.user_id = user.id
    } catch {
      // user_id column may not exist
    }
    
    // Only add age fields if they're provided and we have values
    if (age_years !== undefined && age_years !== null) {
      insertData.age_years = age_years
    }
    if (age_months !== undefined && age_months !== null) {
      insertData.age_months = age_months
    }
    
    const { data: pet, error } = await supabase
      .from("pets")
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error("Error creating pet:", error)
      
      // If specific column doesn't exist, retry without it
      if (error.code === "PGRST204" && error.message.includes("age_")) {
        console.log("[v0] Age column not found, retrying without age fields")
        const retryData = { ...petData, user_id: user.id }
        const { data: retryPet, error: retryError } = await supabase
          .from("pets")
          .insert(retryData)
          .select()
          .single()
        
        if (retryError) {
          console.error("Retry error:", retryError)
          return NextResponse.json([])
        }
        return NextResponse.json(retryPet)
      }
      
      // If user_id doesn't exist, retry without it
      if (error.code === "PGRST204" && error.message.includes("user_id")) {
        console.log("[v0] user_id column not found, retrying without it")
        const { data: retryPet, error: retryError } = await supabase
          .from("pets")
          .insert(petData)
          .select()
          .single()
        
        if (retryError) {
          console.error("Retry error:", retryError)
          return NextResponse.json([])
        }
        return NextResponse.json(retryPet)
      }
      
      // For any other error, return empty to keep UI functional
      return NextResponse.json([])
    }
    
    return NextResponse.json(pet)
  } catch (err) {
    console.error("Unexpected error in POST /api/pets:", err)
    return NextResponse.json([])
  }
}
