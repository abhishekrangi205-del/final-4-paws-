import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createAdminClient()
  
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(bookings)
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, status } = await request.json()

  if (!id || !status) {
    return NextResponse.json({ error: "Missing id or status" }, { status: 400 })
  }

  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)

  if (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
