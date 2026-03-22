"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sun, Home, Scissors, Sparkles, ChevronDown, Check, ArrowRight } from "lucide-react"

export const services = [
  {
    icon: Sun,
    title: "Pet Day Care",
    value: "pet-day-care",
    description: "Fun-filled days of supervised play, socialization, and activities for your beloved pet.",
    image: "/images/service-grooming.jpg",
    subServices: [
      { name: "Assessment Day", description: "Required prior to daycare or overnight stay", priceSmall: "$89", priceLarge: "$89" },
      { name: "Half Day", description: "Sessions up to 5 hours", priceSmall: "$34", priceLarge: "$38" },
      { name: "Full Day", description: "Sessions up to 9 hours", priceSmall: "$40", priceLarge: "$44" },
      { name: "Extended Day", description: "Sessions up to 12 hours", priceSmall: "$44", priceLarge: "$49" },
      { name: "Express Play", description: "Max 2 hours, any day 6am-6pm", priceSmall: "$25", priceLarge: "$25" },
    ],
  },
  {
    icon: Home,
    title: "Pet Boarding",
    value: "pet-boarding",
    description: "A home away from home with 24/7 care, comfort, and love for overnight stays.",
    image: "/images/service-bath.jpg",
    subServices: [
      { name: "Assessment Day", description: "Required prior to daycare or overnight stay", priceSmall: "$89", priceLarge: "$89" },
      { name: "1–7 Nights", description: "Daycare included in overnight stay", priceSmall: "$79", priceLarge: "$85" },
      { name: "Each Additional Pup (1–7 Nights)", description: "Multiple dogs must share quarters for multi-dog pricing", priceSmall: "$69", priceLarge: "$75" },
      { name: "8+ Nights", description: "Daycare included in overnight stay", priceSmall: "$74", priceLarge: "$80" },
      { name: "Each Additional Pup (8+ Nights)", description: "Multiple dogs must share quarters for multi-dog discount", priceSmall: "$64", priceLarge: "$70" },
    ],
  },
  {
    icon: Scissors,
    title: "Grooming",
    value: "grooming",
    description: "Professional grooming services to keep your pet looking and feeling their absolute best.",
    image: "/images/service-nails.jpg",
    groomingCards: [
      {
        title: "Full Groom",
        description: "Haircut, bath, blow dry, brush out, nail trim\n(Shaved Poodle paws +$25)\nBONUS: Ear & Teeth clean",
        pricing: [
          { size: "Toy/X-Small", price: "$60" },
          { size: "Small", price: "$80" },
          { size: "Medium", price: "$100" },
          { size: "Large", price: "$120" },
          { size: "X-Large", price: "$140+" },
        ],
      },
      {
        title: "Bath Only",
        description: "Bath, blow dry, brush out, nail trim\nBONUS: Ear & Teeth clean",
        pricing: [
          { size: "Toy/X-Small", price: "$40" },
          { size: "Small", price: "$65" },
          { size: "Medium", price: "$80" },
          { size: "Large", price: "$100" },
          { size: "X-Large", price: "$120+" },
        ],
      },
      {
        title: "Walk-In Services",
        description: "Individual services available between grooming appointments\nNo baths or full grooming\nWalk-in: $15 each + HST",
        services: ["Nails", "Teeth Brushing", "Ear Cleaning", "Gland Care"],
        trims: [
          { name: "Sanitary Trim", price: "$15" },
          { name: "Paw Pad Trim", price: "$15" },
          { name: "Face Trim", price: "$25" },
        ],
      },
    ],
    addOns: [
      { name: "Hypoallergenic", price: "$5" },
      { name: "Medicated", price: "$5" },
      { name: "Deshedding", price: "$10 / 10 min" },
      { name: "Deskunk", price: "$40" },
      { name: "All Natural Cosmetic Teeth Cleaning", price: "$209" },
    ],
    subServices: [],
  },
  {
    icon: Sparkles,
    title: "All Natural Cosmetic Teeth Cleaning",
    value: "teeth-cleaning",
    description: "A gentle, anesthesia-free teeth cleaning that helps remove plaque, tartar, and stains while improving your pet's oral hygiene and breath.",
    image: "/images/service-puppy.jpg",
    isHighlighted: true,
    price: "$209",
    whatsIncluded: [
      "Plaque & tartar removal",
      "Teeth polishing",
      "Breath freshening",
      "Oral health check",
    ],
    notes: [
      "No anesthesia required",
      "Safe and stress-free process",
      "Best results with regular maintenance",
    ],
    subServices: [],
  },
]

export function ServicesSection() {
  const [expandedService, setExpandedService] = useState<number | null>(null)

  const toggleService = (index: number) => {
    setExpandedService(expandedService === index ? null : index)
  }

  return (
    <section id="services" className="py-10 md:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-16">
          <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-primary/10 text-primary text-xs md:text-sm font-medium rounded-full mb-3 md:mb-4">
            Our Services
          </span>
          <h2 className="font-serif text-2xl md:text-5xl font-bold text-foreground mb-2 md:mb-4 text-balance">
            Complete Pet Care Services
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto hidden md:block">
            From daycare to grooming and everything in between, we provide comprehensive care to keep your furry friend happy, healthy, and looking their best.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              isExpanded={expandedService === index}
              onToggle={() => toggleService(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  isExpanded,
  onToggle,
}: {
  service: (typeof services)[0]
  isExpanded: boolean
  onToggle: () => void
}) {
  const Icon = service.icon
  const hasPricing = service.subServices.some((s) => "priceSmall" in s)
  const hasGroomingCards = "groomingCards" in service && service.groomingCards
  const isHighlighted = "isHighlighted" in service && service.isHighlighted

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    const bookingSection = document.getElementById("contact")
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" })
    }
    // Dispatch custom event to set the service in the booking form
    window.dispatchEvent(new CustomEvent("selectService", { detail: service.value }))
  }

  return (
    <div className="bg-card rounded-xl md:rounded-3xl overflow-hidden border border-border group hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-3 md:p-6 flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left cursor-pointer"
      >
        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 md:w-7 md:h-7 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-sm md:text-2xl font-semibold text-foreground leading-tight">
            {service.title}
          </h3>
          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed hidden md:block mt-2">
            {service.description}
          </p>
        </div>
        <div
          className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
        </div>
      </button>

      {/* Sub-services / Grooming Cards */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3 md:px-6 md:pb-6">
          <div className="border-t border-border pt-3 md:pt-4">
            {/* Grooming Cards Layout */}
            {hasGroomingCards ? (
              <>
                <div className="grid gap-3 md:gap-4">
                  {service.groomingCards?.map((card, cardIndex) => (
                    <div key={cardIndex} className="bg-secondary/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-border">
                      <h4 className="font-serif text-sm md:text-lg font-semibold text-foreground mb-1 md:mb-2">
                        {card.title}
                      </h4>
                      <p className="text-muted-foreground text-xs md:text-sm whitespace-pre-line mb-2 md:mb-3 hidden md:block">
                        {card.description}
                      </p>
                      
                      {/* Pricing Table */}
                      {"pricing" in card && card.pricing && (
                        <div className="space-y-1">
                          {card.pricing.map((item, priceIndex) => (
                            <div key={priceIndex} className="flex justify-between items-center text-xs md:text-sm">
                              <span className="text-foreground">{item.size}</span>
                              <span className="font-semibold text-primary">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Walk-in Services List */}
                      {"services" in card && card.services && (
                        <div className="mb-2 md:mb-3">
                          <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 md:mb-2">Services</p>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {card.services.map((svc, svcIndex) => (
                              <span key={svcIndex} className="px-1.5 py-0.5 md:px-2 md:py-1 bg-primary/10 text-primary text-[10px] md:text-xs rounded-full">
                                {svc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Trims */}
                      {"trims" in card && card.trims && (
                        <div>
                          <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 md:mb-2">Trims (pet must be clean)</p>
                          <div className="space-y-1">
                            {card.trims.map((trim, trimIndex) => (
                              <div key={trimIndex} className="flex justify-between items-center text-xs md:text-sm">
                                <span className="text-foreground">{trim.name}</span>
                                <span className="font-semibold text-primary">{trim.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Add-Ons Section */}
                {"addOns" in service && service.addOns && (
                  <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-border">
                    <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 md:mb-3">Add-Ons</p>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {service.addOns.map((addOn, addOnIndex) => (
                        <div key={addOnIndex} className="flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 bg-secondary rounded-full text-[10px] md:text-sm">
                          <span className="text-foreground">{addOn.name}</span>
                          <span className="font-semibold text-primary">{addOn.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : isHighlighted ? (
              <>
                {/* Highlighted Teeth Cleaning Layout */}
                <div className="bg-primary/5 rounded-xl md:rounded-2xl p-3 md:p-4 border border-primary/20 mb-3 md:mb-4">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <span className="text-[10px] md:text-xs font-medium text-primary uppercase tracking-wider">Standard Price</span>
                    <span className="text-lg md:text-2xl font-bold text-primary">{"price" in service ? service.price : ""}</span>
                  </div>
                  
                  {/* What's Included */}
                  {"whatsIncluded" in service && service.whatsIncluded && (
                    <div className="mb-3 md:mb-4">
                      <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 md:mb-2">What&apos;s Included</p>
                      <ul className="space-y-1 md:space-y-2">
                        {service.whatsIncluded.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center gap-1.5 md:gap-2">
                            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                            </div>
                            <span className="text-foreground text-xs md:text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {"notes" in service && service.notes && (
                    <div className="pt-2 md:pt-3 border-t border-border">
                      <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 md:mb-2">Good to Know</p>
                      <ul className="space-y-1">
                        {service.notes.map((note, noteIndex) => (
                          <li key={noteIndex} className="flex items-start gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
                            <span className="text-primary">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Standard Sub-services Layout */}
                {hasPricing && (
                  <div className="flex gap-2 md:gap-4 mb-2 md:mb-3 text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span className="flex-1">Service</span>
                    <span className="w-10 md:w-16 text-center">Small</span>
                    <span className="w-10 md:w-16 text-center">Large</span>
                  </div>
                )}
                {!hasPricing && service.subServices.length > 0 && (
                  <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 md:mb-3">
                    Services Included
                  </p>
                )}
                <ul className="space-y-2 md:space-y-3">
                  {service.subServices.map((subService, subIndex) => (
                    <li key={subIndex} className="flex items-start gap-2 md:gap-3">
                      <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-foreground font-medium text-xs md:text-sm">
                          {subService.name}
                        </span>
                        <p className="text-muted-foreground text-[10px] md:text-xs mt-0.5 hidden md:block">
                          {subService.description}
                        </p>
                      </div>
                      {"priceSmall" in subService && (
                        <>
                          <span className="w-10 md:w-16 text-center text-xs md:text-sm font-semibold text-primary">
                            {subService.priceSmall}
                          </span>
                          <span className="w-10 md:w-16 text-center text-xs md:text-sm font-semibold text-primary">
                            {subService.priceLarge}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            
            {/* Book Now Button */}
            <button
              onClick={handleBookNow}
              className="mt-4 md:mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-primary text-primary-foreground rounded-full text-xs md:text-base font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Book Now
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
