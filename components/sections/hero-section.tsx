"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("book")
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.jpeg"
          alt="Dogs playing at 4 Paws daycare facility"
          fill
          className="object-cover blur-[2px]"
          priority
        />
        {/* Dark Overlay - 35% opacity */}
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Heading */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight">
            Groom. Stay. Play.
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white font-medium tracking-wide">
            One stop, done the right way.
          </p>
          
          {/* Supporting Text */}
          <p className="text-base md:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto">
            {"Sudbury's largest private daycare for your furry friends."}
          </p>

          {/* CTA Button */}
          <div className="pt-6">
            <Button 
              size="lg" 
              className="rounded-full text-lg px-10 py-6 bg-primary hover:bg-primary/90"
              onClick={scrollToBooking}
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
