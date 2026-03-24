import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all pets for this user
    let { data: pets, error: petsError } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Fallback if user_id column doesn't exist
    if (petsError && petsError.message?.includes("user_id")) {
      const fallback = await supabase
        .from("pets")
        .select("*")
        .order("created_at", { ascending: false })
      pets = fallback.data
    }

    if (!pets || pets.length === 0) {
      return NextResponse.json([])
    }

    // Fetch vaccinations for each pet if table exists
    const petsWithVaccinations = await Promise.all(
      pets.map(async (pet) => {
        const { data: vaccinations } = await supabase
          .from("vaccination_records")
          .select("*")
          .eq("pet_id", pet.id)
          .order("date_administered", { ascending: false })

        return {
          ...pet,
          vaccinations: vaccinations || [],
        }
      })
    )

    return NextResponse.json(petsWithVaccinations)
  } catch (error) {
    console.error("Error fetching pet details:", error)
    return NextResponse.json({ error: "Failed to fetch pet details" }, { status: 500 })
  }
}
