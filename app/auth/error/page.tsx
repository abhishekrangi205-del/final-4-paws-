import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PawPrint, AlertCircle } from 'lucide-react'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-serif">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.error ? (
                <p className="text-center text-sm text-muted-foreground">
                  Error: {params.error}
                </p>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  An unexpected error occurred. Please try again.
                </p>
              )}
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Try Again</Link>
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
