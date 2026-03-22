"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { PawPrint, LogOut, ArrowLeft, Mail, User, Dog, Calendar, ChevronRight } from "lucide-react"
import { PetProfileManager } from "@/components/pet-profile"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type Tab = "profile" | "pets" | "bookings"

export default function AccountPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const router = useRouter()
  
  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
      if (!user) {
        router.push("/auth/login")
      }
    })
  }, [router])
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }
  
  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }
  
  if (!user) return null
  
  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold text-foreground">Paws & Bubbles</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "profile" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4 inline-block mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("pets")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "pets" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Dog className="w-4 h-4 inline-block mr-2" />
            My Pets
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "bookings" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 inline-block mr-2" />
            My Bookings
          </button>
        </div>
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {user.user_metadata?.full_name || "Welcome!"}
                  </h1>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                {user.user_metadata?.full_name && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{user.user_metadata.full_name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveTab("pets")}
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Dog className="w-5 h-5 text-primary" />
                  <span className="font-medium">Manage Pet Profiles</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="border-t border-border" />
              <Link
                href="/#book"
                className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">Book an Appointment</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        )}
        
        {/* Pets Tab */}
        {activeTab === "pets" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">My Pets</h2>
              <p className="text-muted-foreground">
                Manage your pet profiles and vaccination records
              </p>
            </div>
            <PetProfileManager />
          </div>
        )}
        
        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <BookingsTab userId={user.id} />
        )}
      </main>
    </div>
  )
}

function BookingsTab({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchBookings = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("booking_date", { ascending: false })
      
      setBookings(data || [])
      setIsLoading(false)
    }
    fetchBookings()
  }, [userId])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading bookings...</div>
      </div>
    )
  }
  
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">No bookings yet</p>
        <Button asChild>
          <Link href="/#book">Book Your First Appointment</Link>
        </Button>
      </div>
    )
  }
  
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
  }
  
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-foreground">My Bookings</h2>
        <p className="text-muted-foreground">View your appointment history</p>
      </div>
      
      {bookings.map((booking) => (
        <div 
          key={booking.id}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground">{booking.service}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(booking.booking_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {booking.booking_time && ` at ${booking.booking_time}`}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] || "bg-secondary"}`}>
              {booking.status}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span>Pet: {booking.pet_name}</span>
            {booking.total_price_cents && (
              <span className="ml-4">Total: ${(booking.total_price_cents / 100).toFixed(2)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
