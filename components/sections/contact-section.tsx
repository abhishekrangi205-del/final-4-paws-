"use client"

import { useState, useEffect } from "react"
import { MapPin, Phone, Mail, Clock, ChevronLeft, ChevronRight, Loader2, User, Check, ArrowLeft, CreditCard, Sun, Home, Scissors, Sparkles, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { SERVICES, formatPrice, getAddOns, getMainServices, DAYCARE_PRICING, ADDITIONAL_DOG_PRICING, DAYCARE_CONFIG, type ServiceProduct } from "@/lib/products"
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
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [showAgreementWarning, setShowAgreementWarning] = useState(false)
  const [agreedToTeethCleaning, setAgreedToTeethCleaning] = useState(false)
  const [showTeethCleaningWarning, setShowTeethCleaningWarning] = useState(false)
  // Daycare specific states
  const [petSize, setPetSize] = useState<"small" | "large">("small")
  const [additionalDog, setAdditionalDog] = useState(false)
  const [dropOffTime, setDropOffTime] = useState<string>("")
  const [pickUpTime, setPickUpTime] = useState<string>("")
  const [bookedSlots, setBookedSlots] = useState<Array<{ time: string; dropOff: string; pickUp: string; service: string }>>([])
  const [timeError, setTimeError] = useState<string>("")
  
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
  
  // Generate time options (6 AM to 6 PM in 30-minute intervals)
  const generateTimeOptions = () => {
    const times: string[] = []
    for (let hour = 6; hour <= 18; hour++) {
      times.push(`${hour}:00`)
      if (hour < 18) times.push(`${hour}:30`)
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  // Check if selected service is a daycare service
  const hasDaycareSelected = () => {
    return selectedServices.some(s => s.category === "pet-day-care")
  }

  // Get the selected daycare service
  const getSelectedDaycareService = () => {
    return selectedServices.find(s => s.category === "pet-day-care")
  }

  // Calculate daycare price based on size
  const getDaycarePrice = (service: ServiceProduct, size: "small" | "large") => {
    const daycareType = service.daycareType as keyof typeof DAYCARE_PRICING
    if (daycareType && DAYCARE_PRICING[daycareType]) {
      return DAYCARE_PRICING[daycareType][size]
    }
    return service.priceInCents
  }

  // Calculate additional dog price
  const getAdditionalDogPrice = (service: ServiceProduct, size: "small" | "large") => {
    const daycareType = service.daycareType as keyof typeof ADDITIONAL_DOG_PRICING
    if (daycareType && ADDITIONAL_DOG_PRICING[daycareType]) {
      return ADDITIONAL_DOG_PRICING[daycareType][size]
    }
    return 0
  }

  // Validate time selection based on service type
  const validateTimeSelection = (dropOff: string, pickUp: string, service: ServiceProduct) => {
    if (!dropOff || !pickUp) return ""
    
    const dropOffHour = parseInt(dropOff.split(":")[0])
    const dropOffMin = parseInt(dropOff.split(":")[1]) || 0
    const pickUpHour = parseInt(pickUp.split(":")[0])
    const pickUpMin = parseInt(pickUp.split(":")[1]) || 0
    
    const dropOffTotal = dropOffHour + dropOffMin / 60
    const pickUpTotal = pickUpHour + pickUpMin / 60
    const duration = pickUpTotal - dropOffTotal
    
    if (duration <= 0) {
      return "Pick-up time must be after drop-off time"
    }
    
    const maxHours = service.maxHours || 8
    if (duration > maxHours) {
      return `${service.name} allows maximum ${maxHours} hours. You selected ${duration.toFixed(1)} hours.`
    }
    
    // Express Play specific validation (6 AM - 6 PM only)
    if (service.daycareType === "express-play") {
      if (dropOffHour < 6 || pickUpHour > 18 || (pickUpHour === 18 && pickUpMin > 0)) {
        return "Express Play is only available between 6 AM and 6 PM"
      }
    }
    
    return ""
  }

  // Fetch booked slots when date changes
  useEffect(() => {
    if (selectedDate && hasDaycareSelected()) {
      const dateStr = selectedDate.toISOString().split("T")[0]
      fetch(`/api/bookings/check-slots?date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
          if (data.bookedSlots) {
            setBookedSlots(data.bookedSlots)
          }
        })
        .catch(err => console.error("Error fetching slots:", err))
    }
  }, [selectedDate, selectedServices])

  // Validate time whenever drop-off or pick-up changes
  useEffect(() => {
    const daycareService = getSelectedDaycareService()
    if (daycareService && dropOffTime && pickUpTime) {
      const error = validateTimeSelection(dropOffTime, pickUpTime, daycareService)
      setTimeError(error)
    } else {
      setTimeError("")
    }
  }, [dropOffTime, pickUpTime, selectedServices])

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
    
    if (!agreedToTerms) {
      setShowAgreementWarning(true)
      return
    }
    
    if (hasTeethCleaningSelected() && !agreedToTeethCleaning) {
      setShowTeethCleaningWarning(true)
      return
    }
    
    const isDaycare = hasDaycareSelected()
    const hasValidTime = isDaycare 
      ? (dropOffTime && pickUpTime && !timeError)
      : selectedTime
    
    if (!selectedDate || !hasValidTime || selectedServices.length === 0) {
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
      const isDaycare = hasDaycareSelected()
      
      const { error } = await supabase.from("bookings").insert({
        customer_name: formData.customerName,
        pet_name: formData.petName,
        email: formData.email,
        phone: formData.phone,
        service: serviceNames + (addOnNames ? ` + Add-ons: ${addOnNames}` : ""),
        booking_date: selectedDate.toISOString().split("T")[0],
        booking_time: isDaycare ? dropOffTime : selectedTime,
        drop_off_time: isDaycare ? dropOffTime : null,
        pick_up_time: isDaycare ? pickUpTime : null,
        pet_size: isDaycare ? petSize : null,
        service_type: getSelectedDaycareService()?.daycareType || null,
        additional_dog: additionalDog,
        total_price_cents: getTotalPrice(),
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
    let servicesPrice = 0
    
    selectedServices.forEach(service => {
      if (service.category === "pet-day-care" && service.daycareType) {
        // Use dynamic daycare pricing
        servicesPrice += getDaycarePrice(service, petSize)
        if (additionalDog) {
          servicesPrice += getAdditionalDogPrice(service, petSize)
        }
      } else {
        servicesPrice += service.priceInCents
      }
    })
    
    const addOnsPrice = selectedAddOns.reduce((sum, a) => sum + a.priceInCents, 0)
    return servicesPrice + addOnsPrice
  }

const getAllProductIds = () => {
    const ids = selectedServices.map(s => s.id)
    return [...ids, ...selectedAddOns.map(a => a.id)]
  }

  const hasTeethCleaningSelected = () => {
    return selectedServices.some(s => s.category === "teeth-cleaning") || 
           selectedAddOns.some(a => a.category === "teeth-cleaning")
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
                  
                  {/* Daycare-specific options */}
                  {hasDaycareSelected() && (
                    <>
                      {/* Pet Size Selection */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Pet Size
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPetSize("small")}
                            className={`py-3 px-4 rounded-xl border transition-colors text-center ${
                              petSize === "small"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:bg-secondary"
                            }`}
                          >
                            <p className="font-medium">Small</p>
                            <p className="text-xs opacity-80">Under 30 lbs</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPetSize("large")}
                            className={`py-3 px-4 rounded-xl border transition-colors text-center ${
                              petSize === "large"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:bg-secondary"
                            }`}
                          >
                            <p className="font-medium">Large</p>
                            <p className="text-xs opacity-80">30+ lbs</p>
                          </button>
                        </div>
                      </div>
                      
                      {/* Additional Dog Option */}
                      <div className="bg-secondary/30 rounded-xl p-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={additionalDog}
                            onChange={(e) => setAdditionalDog(e.target.checked)}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                          <div>
                            <span className="text-sm text-foreground font-medium">
                              Additional Dog
                            </span>
                            <p className="text-xs text-muted-foreground">
                              Multiple dogs must share quarters for multi-dog pricing
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {/* Booking Notes */}
                      <div className="bg-primary/10 rounded-xl p-4 text-sm">
                        <p className="font-medium text-foreground mb-2">Important Notes:</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>Drop-off before 9 AM</li>
                          <li>Boarding pick-up by 10 AM</li>
                          <li>Assessment Day is required before first daycare or overnight stay</li>
                        </ul>
                      </div>
                    </>
                  )}
                  
                  {selectedDate && (
                    <div>
                      {hasDaycareSelected() ? (
                        <>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Select Drop-off & Pick-up Time
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Drop-off</p>
                              <select
                                value={dropOffTime}
                                onChange={(e) => setDropOffTime(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground"
                              >
                                <option value="">Select time</option>
                                {timeOptions.map((time) => (
                                  <option key={`drop-${time}`} value={time}>
                                    {time.includes(":00") ? time.replace(":00", ":00 AM/PM").replace(/(\d+)/, (m) => {
                                      const h = parseInt(m)
                                      return h > 12 ? `${h-12}` : h === 0 ? '12' : `${h}`
                                    }) : time}
                                    {parseInt(time.split(":")[0]) < 12 ? " AM" : " PM"}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Pick-up</p>
                              <select
                                value={pickUpTime}
                                onChange={(e) => setPickUpTime(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground"
                              >
                                <option value="">Select time</option>
                                {timeOptions.map((time) => (
                                  <option key={`pick-${time}`} value={time}>
                                    {parseInt(time.split(":")[0]) < 12 ? time + " AM" : (parseInt(time.split(":")[0]) === 12 ? time + " PM" : (parseInt(time.split(":")[0]) - 12) + time.slice(time.indexOf(":")) + " PM")}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          {timeError && (
                            <p className="text-sm text-destructive mt-2">{timeError}</p>
                          )}
                          {getSelectedDaycareService() && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {getSelectedDaycareService()?.name}: Maximum {getSelectedDaycareService()?.maxHours} hours
                            </p>
                          )}
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
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
                  
                  {/* Grooming Agreement */}
                  <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                    <h4 className="font-semibold text-foreground mb-3">Grooming Appointment Policy & Pet Grooming Waiver</h4>
                    <div className="max-h-[200px] overflow-y-auto text-sm text-muted-foreground space-y-4 mb-4 pr-2">
                      <p>
                        By signing this waiver and leaving your pet(s) in the care of All 4 Paws Playcare Inc., you understand that you are entering into a contract for the provision of grooming services. There is a cost associated with the service, and you are agreeing to pay the total due in full promptly upon pick up by cash or check. Refer to the price list and be aware of additional charges.
                      </p>
                      
                      <p>
                        <strong className="text-foreground">Flea Free Facility:</strong> We are a flea-free facility. If at any time during the groom, your pet is found to have fleas, the grooming will be discontinued, and there will be an additional charge for cleanup and fumigation ($60+). We reserve the right to discontinue services due to fleas. If services are discontinued, full fees are payable in full upon pick up by cash or check.
                      </p>
                      
                      <p>
                        <strong className="text-foreground">Accident and Injury Waiver:</strong> Grooming can be a dangerous activity. We are taking sharp instruments near your pet(s), and although we are proud of our safety record, accidents can happen. In the event of an accident, we will promptly inform you to the best of our ability. If your pet(s) is in peril or loss of limb, steps will be taken to secure the safety of your pet(s) prior to contacting you. We are not responsible for any cost arising from accidents or injuries before, during, and after your pet(s) is in our care. We take every precaution as determined by our groomers, operators, and staff to prevent injury, but there is a risk inherent with the process. Sometimes grooming will make evident an underlying medical condition - we will make every effort to inform you of any conditions that we notice during the groom, but are not responsible for any cost arising from same. Note: We are not veterinarians and we do recommend for you to seek professional advice on all matters.
                      </p>
                      
                      <p>
                        <strong className="text-foreground">Matt Waiver:</strong> If your pet(s) is matted, it will be shaved. No excuses. No exceptions. We do not brush out severely matted coats. Matting is painful to your pet and dangerous for their skin. In addition, the hair will be extremely damaged and will continue to matt. An additional charge of $10/10 minutes plus HST in addition to the base price of your groom will apply for the removal of matting. Matting can lead to bruises, cuts, hematoma, ulcers and skin irritation once released & removed - you are accepting responsibility for the conditions of your dogs in releasing All 4 Paws Playcare Inc. of all liability for accident or injury of your pet(s). Please maintain your pet(s).
                      </p>
                      
                      <p>
                        <strong className="text-foreground">Missed Appointment Policy:</strong><br />
                        1st Time - 50% of estimated grooming cost is due and added to your next appointment.<br />
                        2nd Time - 100% of estimated cost is due and added to your next appointment.<br />
                        3rd Time - 100% of estimated groom due and must be paid prior to booking your next appointment and future appointments must be paid in advance prior to booking.
                      </p>
                      
                      <p>
                        <strong className="text-foreground">Late Pick Up Policy:</strong> We allow a 30-minute grace period after notifying you to pick up your pet(s). If for any reason you need more time than that, please notify us prior to your appointment. If you do not pick up your pet(s) within 30 minutes, a $10+HST per 15 minutes will be billed and due prior to pick up. Our facility closes at 6 PM. If your pets are left beyond this point, please return the following day at 6 AM for pick up and there will be a $200+HST charge, which will be paid in full along with your grooming and late fees leading up to 6 PM when picking up your pet(s) at 6 AM sharp the following morning.
                      </p>
                      
                      <p className="font-medium text-foreground">
                        By checking below, you are agreeing that you certify and understand and agree with this policy, and forever release All 4 Paws Playcare Inc., and its operators and staff of all liability and responsibilities for potential accidents, injuries, and/or death.
                      </p>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked)
                          if (e.target.checked) setShowAgreementWarning(false)
                        }}
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-sm text-foreground font-medium">
                        I agree to the grooming terms and conditions
                      </span>
                    </label>
                    {showAgreementWarning && (
                      <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                        <span>Please agree to the terms and conditions to proceed.</span>
                      </p>
                    )}
                  </div>
                  
                  {/* Natural Cosmetic Teeth Cleaning Agreement - Only shows when teeth cleaning is selected */}
                  {hasTeethCleaningSelected() && (
                    <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                      <h4 className="font-semibold text-foreground mb-3">All Natural Cosmetic Teeth Cleaning - Liability Waiver</h4>
                      <div className="max-h-[200px] overflow-y-auto text-sm text-muted-foreground space-y-4 mb-4 pr-2">
                        <p className="font-bold text-foreground text-center">LIABILITY WAIVER AND HOLD HARMLESS AGREEMENT</p>
                        
                        <p>
                          BY SIGNING THIS AGREEMENT, THE ANIMAL(S) OWNER AGREES TO INDEMNIFY AND HOLD ALL 4 PAWS PLAYCARE INC., AND ALL EMPLOYEES AND AGENTS OF ALL 4 PAWS PLAYCARE INC. HARMLESS FROM AND AGAINST ALL CLAIMS, DEMANDS OR CAUSES OF ACTION. LIABILITY, LOSS, DAMAGES, OR EXPENSES, INCLUDING ATTORNEYS FEES AND COSTS, ARISING OUT OF OR IN THE COURSE OF ANY ANIMAL TEETH CLEANING ACTIVITIES.
                        </p>
                        
                        <p>
                          THIS INDEMNITY AND HOLD HARMLESS AGREEMENT SHALL INCLUDE COMPANIES OR ANY OF ITS EMPLOYEES, OFFICERS, OR SHAREHOLDERS FOR NEGLIGENCE AND/OR STRICT LIABILITY.
                        </p>
                        
                        <p>
                          WE WILL NOT USE HOMEOPATHIC REMEDIES, MEDICATION OR SEDATION TO CALM YOUR PET. SHOULD YOU OPT TO GIVE YOUR PUP ANY FORM OF MEDICATION (SUCH AS SPRAY, HEMP, OVER THE COUNTER MEDICATION, PRESCRIBED MEDICATION...), PLEASE MAKE SURE THIS IS NOT THE FIRST TIME GIVING IT TO THEM TO ENSURE THEY ARE NOT HAVING ANY REACTION WHILE WITH ALL 4 PAWS PLAYCARE INC. STAFF.
                        </p>
                        
                        <p>
                          TO RELEASE AND HOLD, ALL 4 PAWS PLAYCARE INC., ITS PRINCIPALS, OFFICERS, DIRECTORS, AGENTS AND/OR EMPLOYEES HARMLESS FROM AND AGAINST ANY CLAIMS, LIABILITIES, DEMANDS, ACTIONS OR CAUSES OF ACTION FOR ANY INJURIES, HARM, LOSS, INCONVENIENCE, OR DAMAGES HOWSOEVER SUFFERED ARISING FROM THE SERVICES PROVIDED.
                        </p>
                        
                        <p>
                          EVERY EFFORT WILL BE MADE TO CLEAN AND REMOVE ALL THE TARTAR (CALCULUS) FROM YOUR PET'S TEETH, WITHIN THE LIMITS AS PRESCRIBED BY STATUTE AND CASE LAW FOR A PERSON WHO IS NOT LICENSED TO PRACTICE VETERINARY MEDICINE. IT IS IMPORTANT TO NOTE THAT YOUR PET WILL BE AWAKE AND DEPENDING ON HOW MUCH THEY WIGGLE IT MAY BE IMPOSSIBLE TO REMOVE ALL TARTAR ABOVE THE GUM LINE FROM THEIR TEETH.
                        </p>
                        
                        <p>
                          WE STRIVE TO BE ON TIME FOR YOUR APPOINTMENT. WE HAVE NO CONTROL OVER HOW LONG THE DOG IN FRONT OF YOURS TAKES. PLEASE BE PATIENT.
                        </p>
                        
                        <p>
                          AS A PRECAUTIONARY, WE RECOMMEND ALL OF OUR CLIENTS TO CONSULT WITH THEIR VETERINARIAN, PRIOR TO AND/OR THEREAFTER THEIR COSMETIC TEETH CLEANING.
                        </p>
                        
                        <p className="font-medium text-foreground">
                          NOTE: WE ARE NOT VETERINARIANS, AND THIS PROCEDURE SHOULD NOT BE CONSIDERED A VETERINARY CLEANING BUT A COSMETIC CLEANING ONLY.
                        </p>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreedToTeethCleaning}
                          onChange={(e) => {
                            setAgreedToTeethCleaning(e.target.checked)
                            if (e.target.checked) setShowTeethCleaningWarning(false)
                          }}
                          className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-sm text-foreground font-medium">
                          I agree to the teeth cleaning liability waiver
                        </span>
                      </label>
                      {showTeethCleaningWarning && (
                        <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                          <span>Please agree to the teeth cleaning liability waiver to proceed.</span>
                        </p>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full rounded-full text-lg"
                    disabled={
                      isSubmitting || 
                      !selectedDate || 
                      !agreedToTerms || 
                      (hasTeethCleaningSelected() && !agreedToTeethCleaning) ||
                      (hasDaycareSelected() ? (!dropOffTime || !pickUpTime || !!timeError) : !selectedTime)
                    }
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
