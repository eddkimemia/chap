'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
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
      <h1 className="text-2xl font-bold text-navy mb-2">Dashboard Error</h1>
      <p className="text-slate-400 text-sm mb-6 max-w-md text-center">
        Something went wrong loading this page. Please try again.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.history.back()} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Go Back
        </Button>
        <Button onClick={reset} className="rounded-xl bg-royal hover:bg-royal/90">
          Try Again
        </Button>
      </div>
      <Link href="/dashboard" className="mt-4 text-sm text-royal hover:underline">
        Return to Dashboard Home
      </Link>
    </div>
  )
}
