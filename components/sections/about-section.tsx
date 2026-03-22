"use client"

import Image from "next/image"
import { Award, Heart, Shield, Clock } from "lucide-react"

const features = [
  {
    icon: Award,
    title: "Certified Staff",
    description: "Our team is professionally trained in pet care, grooming, and behavior.",
  },
  {
    icon: Heart,
    title: "Safe Playcare",
    description: "Supervised play areas with trained staff ensuring safe socialization.",
  },
  {
    icon: Shield,
    title: "Clean Environment",
    description: "Sanitized facilities with premium, pet-safe products throughout.",
  },
  {
    icon: Clock,
    title: "Flexible Hours",
    description: "Drop-off and pick-up options that fit your busy schedule.",
  },
]

const stats = [
  { value: "5,000+", label: "Happy Pets" },
  { value: "15+", label: "Years Experience" },
  { value: "4.9", label: "Average Rating" },
  { value: "100%", label: "Love Guarantee" },
]

export function AboutSection() {
  return (
    <section id="about" className="py-12 md:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
              <Image
                src="/images/about.jpg"
                alt="Professional pet groomer with a happy dog"
                fill
                className="object-cover"
              />
            </div>
            {/* Stats Overlay */}
            <div className="absolute -bottom-6 left-4 right-4 md:left-6 md:right-6 bg-card rounded-2xl p-4 md:p-6 border border-border shadow-lg">
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-serif text-base md:text-2xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-[10px] md:text-sm leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-10 md:mt-0">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full mb-4">
              About Us
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
              Where Pets Are Family, Not Just Clients
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              All 4 Paws Playcare is your trusted destination for pet grooming and daycare services. Our safe, fun environment lets pets socialize, play, and get pampered by our expert team. Every visit is a tail-wagging experience!
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
