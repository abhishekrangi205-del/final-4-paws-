"use client"

import { useState } from "react"
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
  UserCheck,
  UserX
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Booking = {
  id: string
  customer_name: string
  pet_name: string
  email: string
  phone: string
  service: string
  booking_date: string
  booking_time: string
  notes: string | null
  status: string
  created_at: string
  user_id: string | null
}

const serviceLabels: Record<string, string> = {
  "full-day-playcare": "Full Day Playcare",
  "half-day-playcare": "Half Day Playcare",
  "group-socialization": "Group Socialization",
  "full-grooming": "Full Grooming",
  "spa-bath": "Spa Bath",
  "playcare-grooming": "Playcare + Grooming",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
}

function CalendarView({ 
  bookings, 
  selectedDate, 
  onSelectDate 
}: { 
  bookings: Booking[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))
  
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()
  
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  const getBookingsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return bookings.filter(b => b.booking_date === dateStr)
  }
  
  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }
  
  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }
  
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-lg">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayBookings = getBookingsForDay(day)
          return (
            <button
              key={day}
              onClick={() => onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
              className={`
                aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-colors relative
                ${isSelected(day) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                ${isToday(day) && !isSelected(day) ? "border border-primary" : ""}
              `}
            >
              {day}
              {dayBookings.length > 0 && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected(day) ? "bg-primary-foreground" : "bg-primary"}`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AdminDashboard({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState<string>("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin")
  }

  const refreshBookings = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/admin/bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error refreshing bookings:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      
      if (response.ok) {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
  
  const filteredBookings = bookings.filter(b => {
    const matchesDate = b.booking_date === selectedDateStr
    const matchesFilter = filter === "all" || b.status === filter
    return matchesDate && matchesFilter
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    today: bookings.filter(b => b.booking_date === selectedDateStr).length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">All 4 Paws Playcare</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshBookings}
              disabled={isRefreshing}
              className="rounded-full"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-sm text-muted-foreground mb-1">Today</p>
            <p className="text-3xl font-bold text-primary">{stats.today}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <CalendarView 
              bookings={bookings} 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
            />
          </div>

          {/* Bookings List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg">
                  Bookings for {selectedDate.toLocaleDateString("en-US", { 
                    weekday: "long", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </h2>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No bookings for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div 
                      key={booking.id}
                      className="border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              {booking.customer_name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                              {booking.status}
                            </span>
                            {booking.user_id ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary" title="Registered user">
                                <UserCheck className="w-3 h-3" />
                                Member
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground" title="Guest booking">
                                <UserX className="w-3 h-3" />
                                Guest
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {serviceLabels[booking.service] || booking.service}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(booking.id, "confirmed")}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Confirm"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatus(booking.id, "cancelled")}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => updateStatus(booking.id, "completed")}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Dog className="w-4 h-4" />
                          <span>{booking.pet_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{booking.booking_time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{booking.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{booking.email}</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
