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

  let bookings: Array<Record<string, unknown>> = []
  let pets: Array<Record<string, unknown>> = []

  try {
    // Use admin client to bypass RLS for admin operations
    const supabase = createAdminClient()
    
    // Fetch bookings
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError)
    } else {
      bookings = bookingsData || []
    }

    // Fetch pets with vaccination records
    const { data: petsData, error: petsError } = await supabase
      .from("pets")
      .select(`
        *,
        vaccination_records (*)
      `)
      .order("created_at", { ascending: false })

    if (petsError) {
      console.error("Error fetching pets:", petsError)
    } else {
      pets = petsData || []
    }
  } catch (error) {
    console.error("Error initializing admin client:", error)
    // Continue with empty data - the dashboard will show empty state
  }

  return (
    <AdminDashboard 
      initialBookings={bookings} 
      initialPets={pets}
    />
  )
}
