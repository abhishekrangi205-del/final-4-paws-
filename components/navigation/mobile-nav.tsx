"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Scissors, Images, Info, Calendar, User, LogIn, Dog } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navItems = [
  { href: "#hero", label: "Home", icon: Home },
  { href: "#services", label: "Services", icon: Scissors },
  { href: "#gallery", label: "Gallery", icon: Images },
  { href: "#about", label: "About", icon: Info },
  { href: "#book", label: "Book", icon: Calendar },
]

export function MobileNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const router = useRouter()
  
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
        {user ? (
          <Link
            href="/account"
            className="flex flex-col items-center gap-1 py-2 px-3 text-primary hover:text-primary/80 transition-colors touch-manipulation"
          >
            <Dog className="w-5 h-5" />
            <span className="text-[10px] font-medium">My Pets</span>
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="flex flex-col items-center gap-1 py-2 px-3 text-muted-foreground hover:text-primary active:text-primary transition-colors touch-manipulation"
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] font-medium">Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
