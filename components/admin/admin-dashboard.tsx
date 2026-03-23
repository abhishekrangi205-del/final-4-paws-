"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Dog,
  LogOut,
  Check,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  AlertCircle,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

type AdminTab = "bookings" | "pets" | "vaccinations"

type Booking = {
  id: string
  customer_name?: string
  pet_name?: string
  email?: string
  phone?: string
  service?: string
  booking_date?: string
  booking_time?: string
  status?: string
  created_at?: string
}

type Pet = {
  id: string
  name?: string
  breed?: string
  age_years?: number
  size?: string
}

type Vaccination = {
  id: string
  pet_id?: string
  vaccine_name?: string
  date_administered?: string
  expiration_date?: string
  verified?: boolean
  verified_by?: string
  verified_at?: string
  document_pathname?: string
}

interface AdminDashboardProps {
  initialBookings?: Booking[]
  initialPets?: Pet[]
  initError?: string | null
}

export function AdminDashboard({
  initialBookings = [],
  initialPets = [],
  initError = null,
}: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AdminTab>("bookings")
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [pets, setPets] = useState<Pet[]>(initialPets)
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
  const [error, setError] = useState<string | null>(initError)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" })
      router.push("/admin")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  const refreshBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(Array.isArray(data) ? data : [])
      } else if (response.status === 503) {
        setError("Database not configured. Supabase integration required.")
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || "Failed to fetch bookings")
      }
    } catch (err) {
      console.error("[v0] Error refreshing bookings:", err)
      setError("Failed to fetch bookings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPets = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/pets")
      if (response.ok) {
        const data = await response.json()
        setPets(Array.isArray(data) ? data : [])
      } else if (response.status === 503) {
        setError("Database not configured. Supabase integration required.")
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || "Failed to fetch pets")
      }
    } catch (err) {
      console.error("[v0] Error refreshing pets:", err)
      setError("Failed to fetch pets. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status }),
      })

      if (response.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        )
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || "Failed to update booking")
      }
    } catch (err) {
      console.error("[v0] Error updating booking:", err)
      setError("Failed to update booking")
    }
  }

  const refreshVaccinations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/vaccinations")
      if (response.ok) {
        const data = await response.json()
        setVaccinations(Array.isArray(data) ? data : [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || "Failed to fetch vaccinations")
      }
    } catch (err) {
      console.error("[v0] Error refreshing vaccinations:", err)
      setError("Failed to fetch vaccinations. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateVaccinationStatus = async (vaccinationId: string, verified: boolean) => {
    try {
      const response = await fetch("/api/admin/vaccinations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaccinationId, verified }),
      })

      if (response.ok) {
        setVaccinations((prev) =>
          prev.map((v) => (v.id === vaccinationId ? { ...v, verified } : v))
        )
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || "Failed to update vaccination")
      }
    } catch (err) {
      console.error("[v0] Error updating vaccination:", err)
      setError("Failed to update vaccination")
    }
  }

  // Load data on component mount
  useEffect(() => {
    refreshBookings()
    refreshPets()
    refreshVaccinations()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">Manage bookings, pets, and services</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminTab)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="pets">Pets</TabsTrigger>
            <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">All Bookings</h2>
                <p className="text-sm text-muted-foreground">
                  Total: {bookings.length}
                </p>
              </div>
              <Button
                onClick={refreshBookings}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>

            {bookings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No bookings found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {booking.customer_name || "N/A"}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4" />
                            {booking.email || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {booking.phone || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                            <Dog className="w-4 h-4" />
                            Pet: {booking.pet_name || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4" />
                            Date: {booking.booking_date || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Time: {booking.booking_time || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Service:</span>
                          <Badge variant="secondary">{booking.service || "N/A"}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {booking.status || "N/A"}
                          </Badge>
                        </div>
                      </div>

                      {booking.id && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            className="gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            className="gap-1 text-red-600"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">All Pets</h2>
                <p className="text-sm text-muted-foreground">
                  Total: {pets.length}
                </p>
              </div>
              <Button
                onClick={refreshPets}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>

            {pets.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Dog className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No pets found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pets.map((pet) => (
                  <Card key={pet.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Dog className="w-5 h-5" />
                        {pet.name || "N/A"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Breed:</span> {pet.breed || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Age:</span> {pet.age_years ? `${pet.age_years} years` : "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Size:</span> {pet.size || "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Vaccinations Tab */}
          <TabsContent value="vaccinations" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Vaccination Records</h2>
                <p className="text-sm text-muted-foreground">
                  Total: {vaccinations.length}
                </p>
              </div>
              <Button
                onClick={refreshVaccinations}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>

            {vaccinations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No vaccination records found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {vaccinations.map((vax) => (
                  <Card key={vax.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-primary" />
                          <CardTitle className="text-lg">{vax.vaccine_name || "Unknown"}</CardTitle>
                        </div>
                        <Badge variant={vax.verified ? "default" : "secondary"}>
                          {vax.verified ? (
                            <Check className="w-3 h-3 mr-1" />
                          ) : null}
                          {vax.verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Date:</span> {vax.date_administered ? new Date(vax.date_administered).toLocaleDateString() : "N/A"}
                      </p>
                      {vax.expiration_date && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Expires:</span> {new Date(vax.expiration_date).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant={vax.verified ? "destructive" : "default"}
                          onClick={() => updateVaccinationStatus(vax.id, !vax.verified)}
                          className="gap-2"
                        >
                          {vax.verified ? (
                            <>
                              <X className="w-3 h-3" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <Check className="w-3 h-3" />
                              Verify
                            </>
                          )}
                        </Button>
                        {vax.document_pathname && (
                          <a
                            href={`/api/file?pathname=${encodeURIComponent(vax.document_pathname)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto"
                          >
                            <Button size="sm" variant="outline" className="gap-2">
                              <FileText className="w-3 h-3" />
                              Document
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
