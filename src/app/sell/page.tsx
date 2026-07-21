'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Loader2,
  Tag,
  Sparkles,
  Car, Building2, Monitor, Smartphone, Shirt, Briefcase, Wrench,
  TreePine, Sofa, Heart, Dumbbell, ShoppingBag, BookOpen, Baby,
  PawPrint, UtensilsCrossed, Palette, Plane,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  car: Car, home: Building2, monitor: Monitor, smartphone: Smartphone,
  shirt: Shirt, briefcase: Briefcase, wrench: Wrench, trees: TreePine,
  sofa: Sofa, heart: Heart, dumbbell: Dumbbell, building: Building2,
  book: BookOpen, baby: Baby, 'paw-print': PawPrint, utensils: UtensilsCrossed,
  palette: Palette, plane: Plane,
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'
import dynamic from 'next/dynamic'
import { Header } from '@/components/classifieds/header'

const RichEditor = dynamic(() => import('@/components/classifieds/rich-editor'), { ssr: false })
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
  parentId: string | null
  children?: Category[]
  _count?: { listings: number }
}

interface Location {
  id: string
  name: string
  slug: string
  level?: number
  parentId?: string | null
}

interface ImagePreview {
  file: File
  url: string
}

export default function SellPage() {
  const router = useRouter()
  const currentUser = useAppStore((s) => s.currentUser)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [images, setImages] = useState<ImagePreview[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [maxImages, setMaxImages] = useState(10)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    subcategoryId: '',
    locationId: '',
    areaId: '',
    condition: 'Used',
    isNegotiable: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, locRes, subRes] = await Promise.all([
          apiFetch('/api/categories'),
          apiFetch('/api/locations'),
          apiFetch('/api/subscriptions'),
        ])
        if (catRes.ok) setCategories(await catRes.json())
        if (locRes.ok) setLocations(await locRes.json())
        if (subRes.ok) {
          const subs = await subRes.json()
          const active = Array.isArray(subs) ? subs.find((s: { status: string }) => s.status === 'active') : null
          const planMax = active?.plan?.maxImages
          setMaxImages(planMax === -1 ? 999 : planMax || 10)
        }
      } catch (error) {
        console.error('Failed to fetch sell page data:', error)
      }
    }
    fetchData()
  }, [])

  const updateForm = (field: string, value: string | number | boolean | string[]) => setForm((prev) => ({ ...prev, [field]: value }))

  const parentCategories = categories.filter((c) => !c.parentId)
  const selectedParent = parentCategories.find((c) => c.id === form.categoryId)
  const subcategories = selectedParent?.children || []

  const counties = locations.filter((l) => l.level === 1)
  const hasHierarchy = counties.length > 0
  const flatLocations = !hasHierarchy ? locations : []
  const selectedCounty = counties.find((c) => c.id === form.locationId)
  const areas = selectedCounty ? locations.filter((l) => l.parentId === selectedCounty.id) : []

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return
    const newImages: ImagePreview[] = []
    Array.from(files).slice(0, maxImages - images.length).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push({ file, url: URL.createObjectURL(file) })
      }
    })
    setImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await apiFetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Image upload failed')
    const data = await res.json()
    return data.url
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.categoryId || !form.locationId) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const uploaded = await Promise.all(images.map((img) => uploadImage(img.file)))

      const catSlugMap: Record<string, string> = {}
      categories.forEach((c) => {
        catSlugMap[c.id] = c.slug
        c.children?.forEach((ch) => { catSlugMap[ch.id] = ch.slug })
      })
      const locSlugMap: Record<string, string> = {}
      locations.forEach((l) => { locSlugMap[l.id] = l.slug })
      const selectedLocationId = form.areaId || form.locationId

      const res = await apiFetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price || '0'),
          categorySlug: catSlugMap[form.subcategoryId || form.categoryId] || form.subcategoryId || form.categoryId,
          locationSlug: locSlugMap[selectedLocationId] || selectedLocationId,
          condition: form.condition,
          contactName: currentUser?.name || '',
          contactPhone: currentUser?.phone || '',
          contactEmail: currentUser?.email || '',
          isNegotiable: form.isNegotiable,
          images: JSON.stringify(uploaded),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create listing')

      toast.success('Listing submitted for review! It will be published once approved.')
      router.push('/dashboard/listings')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <div className="relative max-w-2xl mx-auto px-4 py-6 sm:py-10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-royal/5 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-red/5 blur-3xl" />
            <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-amber-400/5 blur-3xl" />
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-royal to-royal/80 shadow-lg shadow-royal/20 mb-4">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy tracking-tight">
              Create a Listing
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Fill in the details below and your ad will be reviewed within 24 hours
            </p>
          </div>

          <Card className="rounded-2xl border-0 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Details */}
              <div className="space-y-2">
                <Label className="text-navy font-medium text-sm">
                  Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  placeholder="e.g. iPhone 15 Pro Max 256GB"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  className="rounded-xl h-12 bg-white border-slate-200 focus:border-royal/40 focus:ring-royal/10 transition-all"
                  maxLength={60}
                />
                <div className="flex justify-end">
                  <span className="text-[10px] text-slate-400">{form.title.length}/60</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-navy font-medium text-sm">
                  Description <span className="text-red-400">*</span>
                </Label>
                <RichEditor
                  value={form.description}
                  onChange={(v) => updateForm('description', v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-navy font-medium text-sm">Price (KES)</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-semibold">KSh</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={(e) => updateForm('price', e.target.value)}
                      className="rounded-xl h-12 pl-14 bg-white border-slate-200 focus:border-royal/40 focus:ring-royal/10 transition-all"
                      min={0}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-navy font-medium text-sm">Condition</Label>
                  <Select value={form.condition} onValueChange={(v) => updateForm('condition', v)}>
                    <SelectTrigger className="rounded-xl h-12 bg-white border-slate-200 focus:border-royal/40 focus:ring-royal/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Used">Used</SelectItem>
                      <SelectItem value="Refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasHierarchy ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium text-sm">
                      County <span className="text-red-400">*</span>
                    </Label>
                    <Select value={form.locationId} onValueChange={(v) => { updateForm('locationId', v); updateForm('areaId', '') }}>
                      <SelectTrigger className="rounded-xl h-12 bg-white border-slate-200 focus:border-royal/40 focus:ring-royal/10">
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {counties.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium text-sm">Area / Town (optional)</Label>
                    <Select
                      value={form.areaId}
                      onValueChange={(v) => updateForm('areaId', v)}
                      disabled={!form.locationId || areas.length === 0}
                    >
                      <SelectTrigger className="rounded-xl h-12 bg-white border-slate-200 focus:border-royal/40 focus:ring-royal/10">
                        <SelectValue placeholder={form.locationId ? 'Select area' : 'Pick county first'} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {areas.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-navy font-medium text-sm">
                    Location <span className="text-red-400">*</span>
                  </Label>
                  <Select value={form.locationId} onValueChange={(v) => updateForm('locationId', v)}>
                    <SelectTrigger className="rounded-xl h-12 bg-white border-slate-200 focus:border-royal/40 focus:ring-royal/10">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {flatLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer border border-slate-100">
                <Checkbox
                  id="negotiable"
                  checked={form.isNegotiable}
                  onCheckedChange={(v) => updateForm('isNegotiable', v)}
                  className="rounded-md"
                />
                <div>
                  <span className="text-sm font-medium text-navy">Price is negotiable</span>
                  <p className="text-[10px] text-slate-400">Buyers can make offers on your listing</p>
                </div>
              </label>

              <Separator />

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-navy font-medium text-sm">
                  Category <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => { updateForm('categoryId', v); updateForm('subcategoryId', '') }}
                >
                  <SelectTrigger className="rounded-xl h-12 bg-white border-slate-200 focus:border-royal/40 focus:ring-royal/10">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {parentCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          {(() => { const Icon = iconMap[cat.icon] || ShoppingBag; return <Icon className="h-5 w-5" />; })()}
                          <span>{cat.name}</span>
                          {cat._count && (
                            <span className="text-[10px] text-slate-400 ml-auto">({cat._count.listings})</span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subcategories.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-navy font-medium text-sm">Subcategory (optional)</Label>
                  <Select
                    value={form.subcategoryId}
                    onValueChange={(v) => updateForm('subcategoryId', v)}
                  >
                    <SelectTrigger className="rounded-xl h-12 bg-white border-slate-200 focus:border-royal/40 focus:ring-royal/10">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          <span className="flex items-center gap-2">
                            {sub.icon && <span className="text-base">{sub.icon}</span>}
                            <span>{sub.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              {/* Media */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files) }}
                className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
                  dragOver
                    ? 'border-royal bg-gradient-to-b from-royal/5 to-royal/10 scale-[1.02]'
                    : 'border-slate-200 hover:border-royal/30 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
                    dragOver ? 'bg-royal text-white scale-110' : 'bg-white text-slate-400 shadow-sm border border-slate-200'
                  }`}>
                    <Upload className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">
                      {dragOver ? 'Drop photos here' : 'Drag & drop photos or click to browse'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG or WebP. Max 5MB each.</p>
                  </div>
                  <label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                    <Button type="button" variant="outline" className="rounded-xl cursor-pointer border-slate-200 hover:border-royal/30 hover:bg-royal/5 transition-all">
                      <ImageIcon className="h-4 w-4 mr-2" /> Browse Files
                    </Button>
                  </label>
                </div>
              </div>

              {images.length > 0 && (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 ring-1 ring-slate-200/50">
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                        {i === 0 && (
                          <Badge className="absolute top-1.5 left-1.5 text-[9px] bg-gradient-to-r from-royal to-royal/90 text-white border-0 rounded-md px-1.5">
                            Cover
                          </Badge>
                        )}
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                    {images.length < 10 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-royal/30 hover:bg-royal/5 transition-all bg-slate-50/50">
                        <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
                        <Plus className="h-6 w-6 text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-medium">Add more</span>
                      </label>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: images.length }).map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-6 bg-royal' : 'w-1.5 bg-slate-300'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 ml-2 font-medium">{images.length}/10 photos</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl h-14 bg-gradient-to-r from-accent-red to-accent-red/90 text-white shadow-lg shadow-accent-red/20 hover:shadow-xl hover:shadow-accent-red/30 transition-all border-0 font-semibold text-base"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Publishing...' : 'Publish Ad'}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
