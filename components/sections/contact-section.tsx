"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight, Loader2, User, Check, ArrowLeft, CreditCard, Sun, Home, Scissors, Sparkles, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { SERVICES, formatPrice, getAddOns, getMainServices, type ServiceProduct } from "@/lib/products"
import Link from "next/link"
import dynamic from "next/dynamic"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const Checkout = dynamic(() => import("@/components/checkout"), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
})

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["123 Pet Paradise Lane", "Pawsville, CA 90210"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["(555) 123-PAWS", "(555) 123-7297"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["hello@all4pawsplaycare.com", "bookings@all4pawsplaycare.com"],
  },
  {
    icon: Clock,
    title: "Opening Hours",
    details: ["Mon-Fri: 8am - 7pm", "Sat-Sun: 9am - 6pm"],
  },
]

const serviceCategories = [
  { value: "pet-day-care", label: "Pet Day Care", icon: Sun },
  { value: "pet-boarding", label: "Pet Boarding", icon: Home },
  { value: "grooming", label: "Grooming", icon: Scissors },
  { value: "teeth-cleaning", label: "All Natural Cosmetic Teeth Cleaning", icon: Sparkles },
]

const timeSlots = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
]

function Calendar({ 
  selectedDate, 
  onSelectDate 
}: { 
  selectedDate: Date | null
  onSelectDate: (date: Date) => void 
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
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
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }
  
  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }
  
  const isPastDate = (day: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return checkDate < today
  }
  
  const handleDateClick = (day: number) => {
    if (isPastDate(day)) return
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onSelectDate(date)
  }
  
  return (
    <div className="bg-background rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
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
          const past = isPastDate(day)
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={past}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-lg transition-colors
                ${past ? "text-muted-foreground/50 cursor-not-allowed" : "hover:bg-secondary cursor-pointer"}
                ${isToday(day) ? "border border-primary" : ""}
                ${isSelected(day) ? "bg-primary text-primary-foreground hover:bg-primary" : ""}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type BookingStep = "select-services" | "add-ons" | "booking-details" | "checkout"

export function ContactSection() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [step, setStep] = useState<BookingStep>("select-services")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedServices, setSelectedServices] = useState<ServiceProduct[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<ServiceProduct[]>([])
  const [formData, setFormData] = useState({
    customerName: "",
    petName: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  
  useEffect(() => {
    const supabase = createClient()
    
    const handleSelectService = (event: CustomEvent<string>) => {
      setSelectedCategory(event.detail)
      setStep("select-services")
    }
    
    window.addEventListener("selectService", handleSelectService as EventListener)
    
    // Handle case where Supabase is not configured
    if (!supabase) {
      return () => {
        window.removeEventListener("selectService", handleSelectService as EventListener)
      }
    }
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
          customerName: user.user_metadata?.full_name || "",
        }))
      }
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || "",
          customerName: session.user.user_metadata?.full_name || prev.customerName,
        }))
      }
    })
    
    return () => {
      subscription.unsubscribe()
      window.removeEventListener("selectService", handleSelectService as EventListener)
    }
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleServiceToggle = (service: ServiceProduct) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id)
      if (exists) {
        return prev.filter(s => s.id !== service.id)
      }
      return [...prev, service]
    })
  }

  const handleProceedToAddOns = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service.")
      return
    }
    setStep("add-ons")
  }

  const handleAddOnToggle = (addOn: ServiceProduct) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(a => a.id === addOn.id)
      if (exists) {
        return prev.filter(a => a.id !== addOn.id)
      }
      return [...prev, addOn]
    })
  }

  const handleProceedToDetails = () => {
    setStep("booking-details")
  }

  const handleProceedToCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      alert("Please select a date and time for your appointment.")
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus("idle")
    
    try {
      const supabase = createClient()
      
      // Handle case where Supabase is not configured
      if (!supabase) {
        // Skip database insert and proceed to checkout
        setStep("checkout")
        return
      }
      
      const serviceNames = selectedServices.map(s => s.name).join(", ")
      const addOnNames = selectedAddOns.map(a => a.name).join(", ")
      
      const { error } = await supabase.from("bookings").insert({
        customer_name: formData.customerName,
        pet_name: formData.petName,
        email: formData.email,
        phone: formData.phone,
        service: serviceNames + (addOnNames ? ` + Add-ons: ${addOnNames}` : ""),
        booking_date: selectedDate.toISOString().split("T")[0],
        booking_time: selectedTime,
        notes: formData.notes,
        status: "pending",
        user_id: user?.id || null,
      })
      
      if (error) throw error
      
      setStep("checkout")
    } catch (error) {
      console.error("Error submitting booking:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToServices = () => {
    setStep("select-services")
  }

  const handleBackToAddOns = () => {
    setStep("add-ons")
  }

  const handleBackToDetails = () => {
    setStep("booking-details")
  }

  const handleStartOver = () => {
    setSelectedServices([])
    setSelectedAddOns([])
    setStep("select-services")
  }

  const getTotalPrice = () => {
    const servicesPrice = selectedServices.reduce((sum, s) => sum + s.priceInCents, 0)
    const addOnsPrice = selectedAddOns.reduce((sum, a) => sum + a.priceInCents, 0)
    return servicesPrice + addOnsPrice
  }

  const getAllProductIds = () => {
    return [...selectedServices.map(s => s.id), ...selectedAddOns.map(a => a.id)]
  }

  const mainServices = getMainServices()
  const filteredServices = selectedCategory 
    ? mainServices.filter(s => s.category === selectedCategory)
    : mainServices

  const getCategoryIcon = (category: string) => {
    const cat = serviceCategories.find(c => c.value === category)
    return cat?.icon || Sun
  }
  
  return (
    <section id="contact" className="py-12 md:py-24 pb-28 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Book Now
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Schedule Your Appointment
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose your preferred services, date, and time. Complete your booking with secure payment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <div key={index} className="bg-card rounded-2xl md:rounded-3xl p-4 md:p-6 border border-border">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm md:text-base mb-1 md:mb-2">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-muted-foreground text-xs md:text-sm leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Booking Form */}
          <div id="book" className="bg-card rounded-2xl md:rounded-3xl p-5 md:p-8 border border-border">
            
            {/* Step 1: Select Services */}
            {step === "select-services" && (
              <>
                <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-2">
                  Select Services
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Choose one or more services for your pet
                </p>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setSelectedCategory("")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === "" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    All Services
                  </button>
                  {serviceCategories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category.value 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                
                {/* Selected Services Summary */}
                {selectedServices.length > 0 && (
                  <div className="bg-primary/10 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">
                        {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} selected
                      </span>
                      <span className="font-bold text-primary">
                        {formatPrice(selectedServices.reduce((sum, s) => sum + s.priceInCents, 0))}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map(service => (
                        <span 
                          key={service.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-full text-xs text-foreground"
                        >
                          {service.name}
                          <button
                            onClick={() => handleServiceToggle(service)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Services List */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 mb-4">
                  {filteredServices.map((service) => {
                    const Icon = getCategoryIcon(service.category)
                    const isSelected = selectedServices.some(s => s.id === service.id)
                    return (
                      <button
                        key={service.id}
                        onClick={() => handleServiceToggle(service)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary hover:bg-primary/5"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10"
                        }`}>
                          {isSelected ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{service.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-primary text-lg">{formatPrice(service.priceInCents)}</p>
                          {service.petSize && service.petSize !== "any" && (
                            <p className="text-xs text-muted-foreground capitalize">{service.petSize} pet</p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Continue Button */}
                <Button 
                  onClick={handleProceedToAddOns}
                  size="lg" 
                  className="w-full rounded-full text-lg"
                  disabled={selectedServices.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Continue to Add-Ons
                </Button>
              </>
            )}

            {/* Step 2: Add-Ons */}
            {step === "add-ons" && (
              <>
                <button
                  onClick={handleBackToServices}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to services
                </button>
                
                <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-2">
                  Enhance Your Visit
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add extra services to make your pet's experience even better
                </p>
                
                {/* Selected Services Summary */}
                <div className="bg-primary/10 rounded-xl p-4 mb-6">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Selected Services:</p>
                  {selectedServices.map(service => (
                    <div key={service.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-foreground">{service.name}</span>
                      <span className="text-sm font-medium text-primary">{formatPrice(service.priceInCents)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Add-Ons List */}
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 mb-6">
                  {getAddOns().map((addOn) => {
                    const isSelected = selectedAddOns.some(a => a.id === addOn.id)
                    return (
                      <button
                        key={addOn.id}
                        onClick={() => handleAddOnToggle(addOn)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left cursor-pointer ${
                          isSelected 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary hover:bg-primary/5"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary"
                        }`}>
                          {isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground">{addOn.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{addOn.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-primary">{formatPrice(addOn.priceInCents)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Selected Add-Ons Summary */}
                {selectedAddOns.length > 0 && (
                  <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                    <p className="text-sm font-medium text-foreground mb-2">Selected Add-Ons:</p>
                    <div className="space-y-2">
                      {selectedAddOns.map(addOn => (
                        <div key={addOn.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddOnToggle(addOn)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-foreground">{addOn.name}</span>
                          </div>
                          <span className="text-sm font-medium text-primary">{formatPrice(addOn.priceInCents)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Total and Proceed Button */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-medium text-foreground">Subtotal</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <Button 
                    onClick={handleProceedToDetails}
                    size="lg" 
                    className="w-full rounded-full text-lg"
                  >
                    Continue to Booking Details
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    No add-ons needed? Just continue to booking details.
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Booking Details */}
            {step === "booking-details" && (
              <>
                <button
                  onClick={handleBackToAddOns}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to add-ons
                </button>
                
                {/* Order Summary */}
                <div className="bg-primary/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-foreground">Your Order</p>
                    <p className="font-bold text-primary text-xl">{formatPrice(getTotalPrice())}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""}
                    {selectedAddOns.length > 0 && ` + ${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? "s" : ""}`}
                  </div>
                </div>

                {!user && (
                  <div className="mb-4 p-4 bg-secondary/50 rounded-xl flex items-center gap-3">
                    <User className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
                        {" "}or{" "}
                        <Link href="/auth/sign-up" className="text-primary font-medium hover:underline">create an account</Link>
                        {" "}for faster checkout.
                      </p>
                    </div>
                  </div>
                )}
                
                {user && (
                  <div className="mb-4 p-4 bg-primary/10 rounded-xl flex items-center gap-3">
                    <User className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      Booking as <span className="font-medium">{user.email}</span>
                    </p>
                  </div>
                )}
                
                {submitStatus === "error" && (
                  <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-xl">
                    Something went wrong. Please try again.
                  </div>
                )}
                
                <form onSubmit={handleProceedToCheckout} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="customerName"
                      placeholder="Your Name"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="rounded-xl"
                      required
                    />
                    <Input
                      type="text"
                      name="petName"
                      placeholder="Pet's Name"
                      value={formData.petName}
                      onChange={handleInputChange}
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-xl"
                    required
                  />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="rounded-xl"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Date
                    </label>
                    <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                  </div>
                  
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Select Time
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`
                              py-2 px-1 text-xs md:text-sm rounded-lg border transition-colors
                              ${selectedTime === time 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "border-border hover:bg-secondary"
                              }
                            `}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <textarea
                    name="notes"
                    placeholder="Tell us about your pet and any special requests..."
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground resize-none"
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full rounded-full text-lg"
                    disabled={isSubmitting || !selectedDate || !selectedTime}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment - {formatPrice(getTotalPrice())}
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* Step 4: Checkout */}
            {step === "checkout" && (
              <>
                <button
                  onClick={handleBackToDetails}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to details
                </button>
                
                <h3 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-2">
                  Complete Your Payment
                </h3>
                <p className="text-muted-foreground mb-6">
                  Secure payment powered by Stripe
                </p>
                
                {/* Order Summary */}
                <div className="bg-primary/10 rounded-xl p-4 mb-6 space-y-3">
                  {/* Services */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Services</p>
                    {selectedServices.map(service => (
                      <div key={service.id} className="flex items-center justify-between py-1">
                        <span className="text-sm text-foreground">{service.name}</span>
                        <span className="text-sm font-medium text-primary">{formatPrice(service.priceInCents)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add-Ons */}
                  {selectedAddOns.length > 0 && (
                    <div className="border-t border-border/50 pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Add-Ons</p>
                      {selectedAddOns.map(addOn => (
                        <div key={addOn.id} className="flex items-center justify-between py-1">
                          <span className="text-sm text-foreground">{addOn.name}</span>
                          <span className="text-sm font-medium text-primary">{formatPrice(addOn.priceInCents)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Booking Details */}
                  <div className="border-t border-border/50 pt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Appointment</p>
                    <p className="text-sm text-foreground">
                      {selectedDate?.toLocaleDateString()} at {selectedTime}
                    </p>
                  </div>
                  
                  {/* Total */}
                  <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary text-lg">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
                
                <Checkout productIds={getAllProductIds()} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
