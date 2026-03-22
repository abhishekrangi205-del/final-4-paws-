import { DesktopNav } from "@/components/navigation/desktop-nav"
import { MobileNav } from "@/components/navigation/mobile-nav"
import { HeroSection } from "@/components/sections/hero-section"
import { ServicesSection } from "@/components/sections/services-section"
import { GallerySection } from "@/components/sections/gallery-section"
import { AboutSection } from "@/components/sections/about-section"
import { ContactSection } from "@/components/sections/contact-section"
import { Footer } from "@/components/sections/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <DesktopNav />
      <MobileNav />
      
      <HeroSection />
      <ServicesSection />
      <GallerySection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
