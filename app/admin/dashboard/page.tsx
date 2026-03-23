import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  console.log("[v0] Admin dashboard - Session check:", !!session)

  if (!session || session.value !== "authenticated") {
    console.log("[v0] Admin dashboard - Redirecting to login (no valid session)")
    redirect("/admin")
  }

  let bookings: Array<Record<string, unknown>> = []
  let pets: Array<Record<string, unknown>> = []
  let initError: string | null = null

  try {
    console.log("[v0] Admin dashboard - Initializing admin client")
    // Use admin client to bypass RLS for admin operations
    const supabase = createAdminClient()
    console.log("[v0] Admin dashboard - Admin client initialized successfully")
    
    // Fetch bookings
    console.log("[v0] Admin dashboard - Fetching bookings")
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })

    if (bookingsError) {
      console.error("[v0] Error fetching bookings:", bookingsError)
    } else {
      bookings = bookingsData || []
      console.log("[v0] Admin dashboard - Fetched", bookings.length, "bookings")
    }

    // Fetch pets with vaccination records
    console.log("[v0] Admin dashboard - Fetching pets")
    const { data: petsData, error: petsError } = await supabase
      .from("pets")
      .select(`
        *,
        vaccination_records (*)
      `)
      .order("created_at", { ascending: false })

    if (petsError) {
      console.error("[v0] Error fetching pets:", petsError)
    } else {
      pets = petsData || []
      console.log("[v0] Admin dashboard - Fetched", pets.length, "pets")
    }
  } catch (error) {
    console.error("[v0] Error initializing admin client:", error)
    initError = error instanceof Error ? error.message : "Failed to initialize admin client"
  }

  return (
    <AdminDashboard 
      initialBookings={bookings} 
      initialPets={pets}
      initError={initError}
    />
  )
}
