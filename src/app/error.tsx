'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-navy mb-2">Something went wrong</h1>
      <p className="text-slate-400 text-sm mb-6 max-w-md text-center">
        An unexpected error occurred. Please try again or contact support if the problem persists.
      </p>
      <Button onClick={reset} className="rounded-xl bg-royal hover:bg-royal/90">
        Try Again
      </Button>
    </div>
  )
}
