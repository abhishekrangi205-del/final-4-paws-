"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PawPrint, LogOut, ArrowLeft, Mail, User } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function AccountPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
      if (!user) {
        router.push("/auth/login")
      }
    })
  }, [router])
  
  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }
  
  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }
  
  if (!user) return null
  
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <PawPrint className="h-8 w-8 text-primary" />
              <span className="font-serif text-2xl font-bold text-foreground">Paws & Bubbles</span>
            </Link>
          </div>
          <Card className="border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-serif">Your Account</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
                {user.user_metadata?.full_name && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{user.user_metadata.full_name}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
