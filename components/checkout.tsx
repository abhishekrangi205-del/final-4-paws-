'use client'

import { CheckCircle, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Checkout() {
  return (
    <div id="checkout" className="w-full max-w-2xl mx-auto">
      <div className="text-center py-12">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
          Booking Confirmed!
        </h2>
        
        <p className="text-muted-foreground text-lg mb-2">
          Your booking has been successfully submitted.
        </p>
        
        <p className="text-muted-foreground mb-8">
          Our team will review your booking and contact you shortly to confirm the appointment details.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-blue-900">
            <strong>What's next?</strong><br/>
            We'll reach out within 24 hours to confirm your appointment and discuss any special requirements for your pet.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" asChild>
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/#contact" asChild>
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Make Another Booking
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
