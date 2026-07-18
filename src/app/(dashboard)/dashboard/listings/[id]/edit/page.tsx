'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  parentId: string | null
}

interface Location {
  id: string
  name: string
  slug: string
}

interface ImagePreview {
  file?: File
  url: string
  existing?: boolean
}

const steps = ['Category', 'Details', 'Media', 'Contact', 'Preview']

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [images, setImages] = useState<ImagePreview[]>([])
  const [dragOver, setDragOver] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    subcategoryId: '',
    locationId: '',
    condition: 'Used',
    isNegotiable: false,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
      const [catRes, locRes, listRes] = await Promise.all([
          apiFetch('/api/categories'),
          apiFetch('/api/locations'),
          apiFetch(`/api/listings/${id}`),
        ])
        if (catRes.ok) setCategories(await catRes.json())
        if (locRes.ok) setLocations(await locRes.json())
        if (listRes.ok) {
      const data = await listRes.json()
      const listing = data.listing || data
          setForm({
            title: listing.title || '',
            description: listing.description || '',
            price: String(listing.price || ''),
            categoryId: listing.categoryId || '',
            subcategoryId: '',
            locationId: listing.locationId || '',
            condition: listing.condition || 'Used',
            isNegotiable: listing.isNegotiable || false,
            contactName: listing.contactName || '',
            contactPhone: listing.contactPhone || '',
            contactEmail: listing.contactEmail || '',
          })
          if (listing.images?.length) {
            setImages(listing.images.map((img) => ({ url: img.url, existing: true })))
          }
        }
      } catch {
        toast.error('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const updateForm = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }))

  const parentCategories = categories.filter((c) => !c.parentId)
  const subcategories = categories.filter((c) => c.parentId === form.categoryId)

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return
    const newImages: ImagePreview[] = []
    Array.from(files).slice(0, 10 - images.length).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push({ file, url: URL.createObjectURL(file) })
      }
    })
    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      if (prev[index]?.file) URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('price', form.price || '0')
      formData.append('categoryId', form.subcategoryId || form.categoryId)
      formData.append('locationId', form.locationId)
      formData.append('condition', form.condition)
      formData.append('isNegotiable', String(form.isNegotiable))
      formData.append('contactName', form.contactName)
      formData.append('contactPhone', form.contactPhone)
      formData.append('contactEmail', form.contactEmail)
      images.forEach((img) => {
        if (img.file) formData.append('images', img.file)
      })

      const res = await apiFetch(`/api/listings/${id}`, {
        method: 'PUT',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')

      toast.success('Listing updated!')
      router.push('/dashboard/listings')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 lg:pl-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  const canNext = () => {
    if (step === 0) return !!form.categoryId
    if (step === 1) return !!form.title && !!form.description
    return true
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 lg:pl-6">
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight">Edit Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">Update your listing details</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i < step
                  ? 'bg-emerald-500 text-white'
                  : i === step
                  ? 'bg-royal text-white shadow-lg shadow-royal/20'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-navy' : 'text-muted-foreground'}`}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <Card className="rounded-2xl border-0 shadow-premium">
        <CardContent className="p-6 sm:p-8">
          {/* Step 0: Category */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-navy">Select Category</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {parentCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateForm('categoryId', cat.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      form.categoryId === cat.id
                        ? 'border-royal bg-royal/5 shadow-lg shadow-royal/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon || '📦'}</span>
                    <span className="text-sm font-medium text-navy">{cat.name}</span>
                  </button>
                ))}
              </div>

              {subcategories.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-navy font-medium mb-3 block">Subcategory</Label>
                    <div className="flex flex-wrap gap-2">
                      {subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => updateForm('subcategoryId', sub.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            form.subcategoryId === sub.id
                              ? 'bg-royal text-white shadow-lg shadow-royal/20'
                              : 'bg-muted text-navy hover:bg-muted/80'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-navy">Listing Details</h2>

              <div className="space-y-2">
                <Label className="text-navy font-medium">Title *</Label>
                <Input
                  placeholder="e.g. iPhone 15 Pro Max"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="rounded-2xl h-12 bg-white border-slate-200"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-navy font-medium">Description *</Label>
                <Textarea
                  placeholder="Describe your item..."
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  className="rounded-2xl min-h-[120px] bg-white border-slate-200 resize-none"
                  maxLength={5000}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Price (KES)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => updateForm('price', e.target.value)}
                    className="rounded-2xl h-12 bg-white border-slate-200"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium">Condition</Label>
                  <Select value={form.condition} onValueChange={(v) => updateForm('condition', v)}>
                    <SelectTrigger className="rounded-2xl h-12 bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Used">Used</SelectItem>
                      <SelectItem value="Refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-navy font-medium">Location *</Label>
                <Select value={form.locationId} onValueChange={(v) => updateForm('locationId', v)}>
                  <SelectTrigger className="rounded-2xl h-12 bg-white border-slate-200">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {locations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="negotiable"
                  checked={form.isNegotiable}
                  onCheckedChange={(v) => updateForm('isNegotiable', v)}
                />
                <Label htmlFor="negotiable" className="text-sm text-navy cursor-pointer">
                  Price is negotiable
                </Label>
              </div>
            </div>
          )}

          {/* Step 2: Media */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-navy">Manage Photos</h2>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files) }}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                  dragOver ? 'border-royal bg-royal/5' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium text-navy">Drop photos or click to browse</p>
                  <label>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
                    <Button type="button" variant="outline" className="rounded-2xl cursor-pointer">
                      <ImageIcon className="h-4 w-4 mr-2" /> Choose Files
                    </Button>
                  </label>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-muted">
                      <img src={img.url} alt="Uploaded image" className="h-full w-full object-cover" />
                      {i === 0 && (
                        <Badge className="absolute top-1 left-1 text-[9px] bg-royal text-white border-0">Cover</Badge>
                      )}
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">{images.length}/10 photos</p>
            </div>
          )}

          {/* Step 3: Contact */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-navy">Contact Information</h2>

              <div className="space-y-2">
                <Label className="text-navy font-medium">Contact Name *</Label>
                <Input
                  value={form.contactName}
                  onChange={(e) => updateForm('contactName', e.target.value)}
                  className="rounded-2xl h-12 bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-navy font-medium">Phone Number *</Label>
                <Input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => updateForm('contactPhone', e.target.value)}
                  className="rounded-2xl h-12 bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-navy font-medium">Email (optional)</Label>
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => updateForm('contactEmail', e.target.value)}
                  className="rounded-2xl h-12 bg-white border-slate-200"
                />
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-navy">Preview Updates</h2>

              <div className="rounded-2xl bg-muted/30 p-6 space-y-4">
                {images.length > 0 && (
                  <div className="h-48 rounded-xl overflow-hidden bg-muted">
                    <img src={images[0].url} alt="Listing thumbnail" className="h-full w-full object-cover" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-navy">{form.title}</h3>
                  <p className="text-2xl font-bold text-royal mt-1">
                    KES {Number(form.price || 0).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{form.description}</p>
                <Separator />
                <div className="text-sm space-y-1">
                  <p className="text-navy font-medium">Contact: {form.contactName}</p>
                  <p className="text-muted-foreground">Phone: {form.contactPhone}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="rounded-2xl">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < steps.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="rounded-2xl bg-royal text-white shadow-lg shadow-royal/20 transition-all border-0"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all border-0 font-semibold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        )}
      </div>
    </div>
  )
}

function Badge({ className, children, ...props }: any) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className || ''}`} {...props}>
      {children}
    </span>
  )
}
