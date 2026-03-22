"use client"

import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const heroImages = [
  {
    src: "/images/hero-1.jpg",
    alt: "Freshly groomed golden retriever",
    before: "Before: Tangled coat",
    after: "After: Silky smooth",
  },
  {
    src: "/images/hero-2.jpg",
    alt: "Pampered poodle after grooming",
    before: "Before: Overgrown fur",
    after: "After: Perfect trim",
  },
  {
    src: "/images/hero-3.jpg",
    alt: "Happy cat after spa treatment",
    before: "Before: Matted fur",
    after: "After: Fluffy coat",
  },
]

export function HeroSection() {
  // Separate carousels for mobile and desktop
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({ loop: true })
  const [desktopEmblaRef, desktopEmblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => desktopEmblaApi?.scrollPrev(), [desktopEmblaApi])
  const scrollNext = useCallback(() => desktopEmblaApi?.scrollNext(), [desktopEmblaApi])

  useEffect(() => {
    if (!mobileEmblaApi) return
    const onSelect = () => setSelectedIndex(mobileEmblaApi.selectedScrollSnap())
    mobileEmblaApi.on("select", onSelect)
    return () => {
      mobileEmblaApi.off("select", onSelect)
    }
  }, [mobileEmblaApi])

  const scrollToBooking = () => {
    const bookingSection = document.getElementById("book")
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="hero" className="relative min-h-screen pt-14 md:pt-20">
      {/* Mobile: Swipeable Gallery */}
      <div className="md:hidden">
        <div className="overflow-hidden" ref={mobileEmblaRef}>
          <div className="flex">
            {heroImages.map((image, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative h-[60vh]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-8 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full mb-2">
                    {image.after}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 py-4">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === selectedIndex ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              onClick={() => mobileEmblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Mobile Content */}
        <div className="px-4 pb-28 space-y-5">
          <h1 className="font-serif text-4xl font-bold text-foreground leading-tight text-balance">
            Where Every Pet Gets the Royal Treatment
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Professional grooming and playcare services where your furry friends play, socialize, and get pampered.
          </p>
          <Button size="lg" className="w-full rounded-full text-lg py-6" onClick={scrollToBooking}>
            Book an Appointment
          </Button>
        </div>
      </div>

      {/* Desktop: Split-Screen Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Side - Image with Carousel */}
        <div className="w-1/2 relative">
          <div className="overflow-hidden h-full" ref={desktopEmblaRef}>
            <div className="flex h-full">
              {heroImages.map((image, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute bottom-8 left-8">
                    <span className="inline-block px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                      {image.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="absolute bottom-8 right-8 flex gap-2">
            <button
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors group"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            </button>
            <button
              onClick={scrollNext}
              className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors group"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {/* Right Side - Content & Booking Form */}
        <div className="w-1/2 flex flex-col justify-center px-12 lg:px-20 py-24">
          <div className="max-w-lg">
            <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-full mb-6">
              Pet Grooming & Playcare
            </span>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 text-balance">
              Where Every Pet Gets the Royal Treatment
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Professional grooming and playcare services. Let your furry friends enjoy playtime, socialization, and expert grooming all in one place.
            </p>

            {/* Booking Form */}
            <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
              <h3 className="font-serif text-xl font-semibold mb-4">
                Book Your Appointment
              </h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Pet's Name"
                    className="rounded-xl"
                  />
                  <Input
                    type="text"
                    placeholder="Your Name"
                    className="rounded-xl"
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="rounded-xl"
                />
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  className="rounded-xl"
                />
                <Button size="lg" className="w-full rounded-full text-lg">
                  Schedule Now
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
