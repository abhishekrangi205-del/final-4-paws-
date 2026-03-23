import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    
    if (!supabase) {
      // Return empty array if database not configured
      return NextResponse.json([])
    }
    
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array instead of error
      if (error.message.includes("not found") || error.message.includes("does not exist")) {
        console.log("Bookings table not found, returning empty array")
        return NextResponse.json([])
      }
      console.error("Error fetching bookings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(bookings || [])
  } catch (err) {
    console.error("Unexpected error fetching bookings:", err)
    // Return empty array on error to keep UI functional
    return NextResponse.json([])
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }
    
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)

    if (error) {
      console.error("Error updating booking:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Unexpected error updating booking:", err)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
