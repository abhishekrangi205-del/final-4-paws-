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
  
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookings:", error)
  }

  return <AdminDashboard initialBookings={bookings || []} />
}
