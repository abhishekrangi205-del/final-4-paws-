"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"

const galleryImages = [
  { src: "/images/gallery-1.jpg", alt: "Groomed golden doodle", pet: "Max" },
  { src: "/images/gallery-2.jpg", alt: "Styled pomeranian", pet: "Bella" },
  { src: "/images/gallery-3.jpg", alt: "Trimmed shih tzu", pet: "Charlie" },
  { src: "/images/gallery-4.jpg", alt: "Fluffy persian cat", pet: "Luna" },
  { src: "/images/gallery-5.jpg", alt: "Groomed husky", pet: "Rocky" },
  { src: "/images/gallery-6.jpg", alt: "Pampered yorkie", pet: "Daisy" },
  { src: "/images/gallery-7.jpg", alt: "Styled maltese", pet: "Cooper" },
  { src: "/images/gallery-8.jpg", alt: "Groomed corgi", pet: "Milo" },
]

export function GallerySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <section id="gallery" className="py-12 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-10">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
            Recent Grooms
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Our Happy Clients
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Swipe through our gallery of freshly groomed pets and their stunning transformations.
          </p>
        </div>
      </div>

      {/* Marquee Gallery */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="relative cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <div className="flex animate-marquee hover:pause">
          {[...galleryImages, ...galleryImages].map((image, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-64 md:w-80 mx-2 group"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="inline-block px-3 py-1 bg-card/90 backdrop-blur-sm text-foreground text-sm font-medium rounded-full">
                    {image.pet}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Touch Hint */}
      <p className="md:hidden text-center text-muted-foreground text-sm mt-6 px-4">
        Swipe or drag to explore more
      </p>
    </section>
  )
}
