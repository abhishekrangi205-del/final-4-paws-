import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get("admin_token")?.value
  
  if (adminToken !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  const supabase = await createClient()
  
  const { data: pets, error } = await supabase
    .from("pets")
    .select(`
      *,
      vaccination_records (*),
      users:user_id (email)
    `)
    .order("created_at", { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(pets)
}
