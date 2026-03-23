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
              At All 4 Paws Playcare Inc., our goal is to be the go-to pet care provider here in Sudbury, ON, while providing exceptional care, socialization, and unforgettable adventures for your fur baby.
            </p>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mt-4">
              Our mission is to create a <span className="font-semibold text-foreground">safe, fun, happy, healthy,</span> and nurturing environment while providing peace of mind for you!
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
