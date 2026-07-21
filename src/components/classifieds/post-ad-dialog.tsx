'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/lib/store'
import { apiFetch } from '@/lib/api-client'
import { toast } from 'sonner'
import { Loader2, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function PostAdDialog() {
  const { showPostAd, setShowPostAd, categories, locations } = useAppStore()

  const [submitting, setSubmitting] = useState(false)
  const [parentCategory, setParentCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [areaSlug, setAreaSlug] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [maxImages, setMaxImages] = useState(10)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'Used',
    location: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    negotiable: false,
  })

  const parentCategories = categories.filter((c) => !c.parentId)
  const selectedParent = categories.find((c) => c.slug === parentCategory && !c.parentId)
  const subCategories = selectedParent?.children || []
  const counties = locations.filter((l) => l.level === 1)
  const selectedCounty = counties.find((c) => c.slug === form.location)
  const areas = selectedCounty ? locations.filter((l) => l.parentId === selectedCounty.id) : []

  useEffect(() => {
    if (showPostAd) {
      setForm({
        title: '',
        description: '',
        price: '',
        condition: 'Used',
        location: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        negotiable: false,
      })
      setParentCategory('')
      setSubCategory('')
      setAreaSlug('')
      setUploadedImages([])
      apiFetch('/api/subscriptions').then((r) => {
        if (!r.ok) return
        r.json().then((subs) => {
          const active = Array.isArray(subs) ? subs.find((s: { status: string }) => s.status === 'active') : null
          const planMax = active?.plan?.maxImages
          setMaxImages(planMax === -1 ? 999 : planMax || 10)
        })
      })
    }
  }, [showPostAd])

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const remaining = maxImages - uploadedImages.length
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const toProcess = fileArray.slice(0, remaining)
    setUploading(true)

    for (const file of toProcess) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported format (JPEG, PNG, WebP only)`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 5MB limit`)
        continue
      }

      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          const data = await res.json()
          setUploadedImages((prev) => [...prev, data.url])
        } else {
          toast.error(`Failed to upload "${file.name}"`)
        }
      } catch {
        toast.error(`Error uploading "${file.name}"`)
      }
    }

    setUploading(false)
  }, [uploadedImages.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!subCategory) {
      toast.error('Please select a subcategory')
      return
    }
    if (!form.location) {
      toast.error('Please select a location')
      return
    }
    if (!form.contactName.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!form.contactPhone.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    setSubmitting(true)
    try {
      const locationSlug = areaSlug || form.location
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: form.price ? parseFloat(form.price) : 0,
          condition: form.condition,
          categorySlug: subCategory,
          locationSlug,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
          isNegotiable: form.negotiable,
          images: JSON.stringify(uploadedImages),
        }),
      })

      if (res.ok) {
        toast.success('Ad submitted for review! It will be published once approved.')
        setShowPostAd(false)
        const listRes = await fetch('/api/listings')
        if (listRes.ok) {
          const data = await listRes.json()
          useAppStore.getState().setListings(data.listings || [])
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to post ad')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={showPostAd} onOpenChange={setShowPostAd}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg rounded-3xl border-slate-100 shadow-premium-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-navy">Post Your Ad</DialogTitle>
          <DialogDescription className="text-slate-400">
            Fill in the details below to list your item on ChapKE.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-navy">Images (optional, max {maxImages})</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => {
                if (uploadedImages.length < maxImages && !uploading) {
                  fileInputRef.current?.click()
                }
              }}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all',
                'hover:border-royal/40 hover:bg-royal/5',
                'border-slate-200 bg-slate-50/50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              {uploading ? (
                <Loader2 className="h-8 w-8 text-royal animate-spin mb-2" />
              ) : (
                <Upload className="h-8 w-8 text-slate-300 mb-2" />
              )}
              <p className="text-sm text-slate-400 text-center font-medium">
                Drag & drop images or click to upload
              </p>
              <p className="text-xs text-slate-300 mt-1">
                JPEG, PNG, WebP · Max 5MB each
              </p>
              {uploadedImages.length > 0 && (
                <p className="text-xs font-semibold text-royal mt-2">
                  {uploadedImages.length}/{maxImages} images
                </p>
              )}
            </div>

            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {uploadedImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 group shadow-sm"
                  >
                    <img
                      src={img}
                      alt={`Upload ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(i)
                      }}
                      className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="ad-title" className="text-sm font-semibold text-navy">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ad-title"
              placeholder="e.g. Toyota Corolla 2018 - Low Mileage"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              maxLength={120}
              className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-royal/30 focus:ring-royal/10 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="ad-desc" className="text-sm font-semibold text-navy">Description</Label>
            <Textarea
              id="ad-desc"
              placeholder="Describe your item in detail..."
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="resize-none rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-royal/30 focus:ring-royal/10 transition-all"
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="ad-price" className="text-sm font-semibold text-navy">Price (KES)</Label>
            <Input
              id="ad-price"
              type="number"
              placeholder="e.g. 150000"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              min={0}
              className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-royal/30 focus:ring-royal/10 transition-all"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="ad-negotiable"
                checked={form.negotiable}
                onCheckedChange={(checked) => updateField('negotiable', !!checked)}
              />
              <Label htmlFor="ad-negotiable" className="text-sm font-normal cursor-pointer text-slate-500">
                Price is negotiable
              </Label>
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-navy">Category</Label>
              <Select value={parentCategory} onValueChange={(v) => { setParentCategory(v); setSubCategory('') }}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50/50 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-navy">Subcategory</Label>
              <Select value={subCategory} onValueChange={setSubCategory}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50/50 text-sm">
                  <SelectValue placeholder={parentCategory ? 'Select' : 'Pick parent first'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {subCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          {counties.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-navy">County</Label>
                <Select value={form.location} onValueChange={(v) => { updateField('location', v); setAreaSlug('') }}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50/50 text-sm">
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {counties.map((loc) => (
                      <SelectItem key={loc.id} value={loc.slug}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-navy">Area / Town</Label>
                <Select
                  value={areaSlug}
                  onValueChange={setAreaSlug}
                  disabled={!form.location || areas.length === 0}
                >
                  <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50/50 text-sm">
                    <SelectValue placeholder={form.location ? 'Select area' : 'Pick county first'} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {areas.map((loc) => (
                      <SelectItem key={loc.id} value={loc.slug}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-navy">Location</Label>
              <Select value={form.location} onValueChange={(v) => updateField('location', v)}>
                <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50/50 text-sm">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.slug}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Condition */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-navy">Condition</Label>
            <Select value={form.condition} onValueChange={(v) => updateField('condition', v)}>
              <SelectTrigger className="w-full rounded-xl border-slate-200 bg-slate-50/50 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <p className="text-sm font-bold text-navy">Contact Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ad-name" className="text-sm font-semibold text-navy">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ad-name"
                  placeholder="Your name"
                  value={form.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-royal/30 focus:ring-royal/10 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ad-phone" className="text-sm font-semibold text-navy">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ad-phone"
                  placeholder="+254 7XX XXX XXX"
                  value={form.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-royal/30 focus:ring-royal/10 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-email" className="text-sm font-semibold text-navy">Email (optional)</Label>
              <Input
                id="ad-email"
                type="email"
                placeholder="your@email.com"
                value={form.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                className="rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-royal/30 focus:ring-royal/10 transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full rounded-xl h-12 font-bold text-base bg-royal shadow-lg shadow-royal/20 transition-all border-0"
            disabled={submitting || uploading}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Posting...
              </>
            ) : (
              'Post Ad'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
