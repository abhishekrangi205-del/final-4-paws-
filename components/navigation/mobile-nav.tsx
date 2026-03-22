"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, Scissors, Images, Info, MapPin, LogIn, Dog } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navItems = [
  { href: "#hero", label: "Home", icon: Home },
  { href: "#services", label: "Services", icon: Scissors },
  { href: "#gallery", label: "Gallery", icon: Images },
  { href: "#about", label: "About", icon: Info },
  { href: "#contact", label: "Contact", icon: MapPin },
]

function PawIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="12" cy="17" rx="5" ry="4" />
      <circle cx="6" cy="10" r="2.5" />
      <circle cx="18" cy="10" r="2.5" />
      <circle cx="9" cy="6" r="2" />
      <circle cx="15" cy="6" r="2" />
    </svg>
  )
}

export function MobileNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  
  useEffect(() => {
    const supabase = createClient()
    
    // Handle case where Supabase is not configured
    if (!supabase) {
      return
    }
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  const handleNavClick = (e: React.MouseEvent<HTMLButtonElement>, href: string) => {
    e.preventDefault()
    const targetId = href.replace("#", "")
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <PawIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-base font-semibold text-foreground">
              All 4 Paws Playcare
            </span>
          </Link>
          {user ? (
            <Link
              href="/account"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <Dog className="w-6 h-6" />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <LogIn className="w-6 h-6" />
            </Link>
          )}
        </div>
      </header>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border pb-safe">
        <div className="flex items-center justify-around py-3 px-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-primary active:text-primary transition-colors touch-manipulation"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
