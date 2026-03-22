"use client"

import Image from "next/image"

export function AboutSection() {
  return (
    <section id="about" className="py-12 md:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] md:aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden">
              <Image
                src="/images/about.jpg"
                alt="Professional pet groomer with a happy dog"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              About Us
            </span>
            <h2 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-4 md:mb-6 text-balance">
              Where Pets Are Family, Not Just Clients
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              All 4 Paws Playcare is your trusted destination for pet grooming and daycare services. Our safe, fun environment lets pets socialize, play, and get pampered by our expert team. Every visit is a tail-wagging experience!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
