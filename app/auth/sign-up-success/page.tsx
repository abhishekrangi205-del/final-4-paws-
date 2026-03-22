import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PawPrint, Mail, CheckCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
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
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-serif">
                Thank You for Signing Up!
              </CardTitle>
              <CardDescription>
                Please check your email to confirm your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
                <Mail className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a confirmation email to your inbox. Click the link in the email to activate your account and start booking grooming appointments.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
