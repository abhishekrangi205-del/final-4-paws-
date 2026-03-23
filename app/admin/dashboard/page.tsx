import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")

  // Redirect to login if not authenticated
  if (!session || session.value !== "authenticated") {
    redirect("/admin")
  }

  // Initialize with empty data - dashboard will fetch via API
  return (
    <AdminDashboard 
      initialBookings={[]} 
      initialPets={[]}
      initError={null}
    />
  )
}
