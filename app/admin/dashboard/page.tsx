import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  if (!session || session.value !== "authenticated") {
    redirect("/admin")
  }

  // Use admin client to bypass RLS for admin operations
  const supabase = createAdminClient()
  
  // Fetch bookings
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  if (bookingsError) {
    console.error("Error fetching bookings:", bookingsError)
  }

  // Fetch pets with vaccination records
  const { data: pets, error: petsError } = await supabase
    .from("pets")
    .select(`
      *,
      vaccination_records (*)
    `)
    .order("created_at", { ascending: false })

  if (petsError) {
    console.error("Error fetching pets:", petsError)
  }

  return (
    <AdminDashboard 
      initialBookings={bookings || []} 
      initialPets={pets || []}
    />
  )
}
