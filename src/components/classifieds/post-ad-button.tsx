'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function PostAdButton({ className, size = "lg" }: { className?: string; size?: "sm" | "lg" | "default" | "icon" }) {
  const { setShowPostAd } = useAppStore()
  return (
    <Button
      size={size}
      className={className || "gap-1.5 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600 hover:shadow-red-500/30 transition-all border-0 font-semibold"}
      onClick={() => setShowPostAd(true)}
    >
      <Plus className="h-3.5 w-3.5" />
      <span>Post an Ad</span>
    </Button>
  )
}
