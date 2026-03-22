import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({ 
  subsets: ["latin"],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'All 4 Paws Playcare | Pet Grooming & Playcare Services',
  description: 'Professional pet grooming and playcare services. Daycare, socialization, and grooming all in one place. Book your appointment today!',
  keywords: ['pet grooming', 'dog grooming', 'cat grooming', 'pet daycare', 'pet playcare', 'dog daycare', 'pet care'],
}

export const viewport: Viewport = {
  themeColor: '#4db6ac',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
