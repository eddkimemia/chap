'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Heart, Eye, MapPin, Trash2, Star, User, Search, Bell,
  BellOff, Clock, Plus, Filter, DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { formatPrice, timeAgo } from '@/lib/format'

import { apiFetch } from '@/lib/api-client'

interface FavoriteListing {
  id: string; title: string; price: number; currency: string
  images: { url: string }[]; location: { name: string }
  category: { name: string }; views: number; condition: string; createdAt: string
}

interface SavedSeller {
  id: string; name: string; avatar?: string; rating: number
  listingsCount: number; joinedAt: string
}

interface SavedSearch {
  id: string; query: string; category?: string; location?: string
  minPrice?: number; maxPrice?: number; alertsEnabled: boolean; createdAt: string
}

interface PriceAlert {
  id: string; listingId: string; listingTitle: string; listingImage?: string
  targetPrice: number; currentPrice: number; direction: 'below' | 'above'
  status: string; createdAt: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteListing[]>([])
  const [sellers, setSellers] = useState<SavedSeller[]>([])
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('listings')
  const { toggleFavorite } = useAppStore()
  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [favRes, sellersRes, searchesRes, alertsRes] = await Promise.all([
        apiFetch('/api/favorites'),
        apiFetch('/api/favorites/sellers'),
        apiFetch('/api/favorites/searches'),
        apiFetch('/api/price-alerts'),
      ])
      if (favRes.ok) { const d = await favRes.json(); setFavorites(d.favorites || []) }
      if (sellersRes.ok) { const d = await sellersRes.json(); setSellers(d.sellers || []) }
      if (searchesRes.ok) { const d = await searchesRes.json(); setSearches(d.searches || []) }
      if (alertsRes.ok) { const d = await alertsRes.json(); setPriceAlerts(d.alerts || []) }
    } catch { toast.error('Failed to load favorites') } finally { setLoading(false) }
  }

  const removeFavorite = async (id: string) => {
    try {
      await apiFetch(`/api/favorites/${id}`, { method: 'DELETE' })
      setFavorites((prev) => prev.filter((f) => f.id !== id))
      toggleFavorite(id)
      toast.success('Removed from favorites')
    } catch { toast.error('Failed to remove') }
  }

  const removeSeller = async (id: string) => {
    try {
      await apiFetch(`/api/favorites/sellers/${id}`, { method: 'DELETE' })
      setSellers((prev) => prev.filter((s) => s.id !== id))
      toast.success('Seller removed')
    } catch { toast.error('Failed to remove seller') }
  }

  const removeSearch = async (id: string) => {
    try {
      await apiFetch(`/api/favorites/searches/${id}`, { method: 'DELETE' })
      setSearches((prev) => prev.filter((s) => s.id !== id))
      toast.success('Search removed')
    } catch { toast.error('Failed to remove search') }
  }

  const toggleAlert = async (id: string, enabled: boolean) => {
    try {
      await apiFetch(`/api/price-alerts/${id}`, { method: 'PUT', body: JSON.stringify({ enabled }) })
      setPriceAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: enabled ? 'active' : 'paused' } : a))
      toast.success(enabled ? 'Alert enabled' : 'Alert paused')
    } catch { toast.error('Failed to update alert') }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Favorites</h1>
        <p className="text-sm text-slate-400 mt-1">Your saved listings, sellers, and searches</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="rounded-2xl bg-muted p-1">
          <TabsTrigger value="listings" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Heart className="h-4 w-4" /> Saved Listings ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="sellers" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="h-4 w-4" /> Sellers ({sellers.length})
          </TabsTrigger>
          <TabsTrigger value="searches" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Search className="h-4 w-4" /> Saved Searches ({searches.length})
          </TabsTrigger>
          <TabsTrigger value="alerts" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Bell className="h-4 w-4" /> Price Alerts ({priceAlerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Saved Listings */}
        <TabsContent value="listings" className="mt-6">
          {renderListingsTab(favorites, loading, removeFavorite)}
        </TabsContent>

        {/* Saved Sellers */}
        <TabsContent value="sellers" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          ) : sellers.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-premium">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <User className="h-12 w-12 text-slate-200 mb-3" />
                <h3 className="text-lg font-bold text-navy">No saved sellers</h3>
                <p className="text-sm text-slate-400 mt-1">Save sellers you trust to find their listings quickly</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellers.map((seller) => (
                <Card key={seller.id} className="rounded-2xl border-0 shadow-premium card-hover overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-royal flex items-center justify-center text-white font-bold text-lg">
                        {seller.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-navy truncate">{seller.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-3 w-3 ${s <= Math.round(seller.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                          ))}
                          <span className="text-xs text-slate-400 ml-1">({seller.rating})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{seller.listingsCount} listings</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0 text-rose-400" onClick={() => removeSeller(seller.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Saved Searches */}
        <TabsContent value="searches" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : searches.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-premium">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-12 w-12 text-slate-200 mb-3" />
                <h3 className="text-lg font-bold text-navy">No saved searches</h3>
                <p className="text-sm text-slate-400 mt-1">Save your search criteria to quickly find what you need</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {searches.map((s) => (
                <Card key={s.id} className="rounded-2xl border-0 shadow-premium card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <Link href={`/search?q=${encodeURIComponent(s.query)}${s.category ? `&category=${s.category}` : ''}${s.location ? `&location=${s.location}` : ''}`}>
                          <p className="font-semibold text-navy truncate hover:text-royal transition-colors">{s.query}</p>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                          {s.category && <Badge variant="outline" className="text-[9px] rounded-lg">{s.category}</Badge>}
                          {s.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {s.location}</span>}
                          {(s.minPrice || s.maxPrice) && <span>{s.minPrice ? `$${s.minPrice}` : '$0'} - {s.maxPrice ? `$${s.maxPrice}` : 'Any'}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => { s.alertsEnabled = !s.alertsEnabled; toast.success(s.alertsEnabled ? 'Alerts enabled' : 'Alerts disabled') }}>
                          {s.alertsEnabled ? <Bell className="h-4 w-4 text-royal" /> : <BellOff className="h-4 w-4 text-slate-300" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400" onClick={() => removeSearch(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Price Alerts */}
        <TabsContent value="alerts" className="mt-6">
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : priceAlerts.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-premium">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="h-12 w-12 text-slate-200 mb-3" />
                <h3 className="text-lg font-bold text-navy">No price alerts</h3>
                <p className="text-sm text-slate-400 mt-1">Set price alerts to get notified when prices drop</p>
                <Button className="mt-4 rounded-xl bg-royal border-0" asChild>
                  <Link href="/"><Plus className="h-4 w-4 mr-1" /> Browse Listings</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {priceAlerts.map((alert) => (
                <Card key={alert.id} className="rounded-2xl border-0 shadow-premium card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                        {alert.listingImage ? <img src={alert.listingImage} alt="Listing thumbnail" className="h-full w-full object-cover" /> : <Star className="h-5 w-5 text-slate-300" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link href={`/listing/${alert.listingId}`}>
                          <p className="font-semibold text-navy truncate hover:text-royal transition-colors">{alert.listingTitle}</p>
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-slate-400 line-through">{formatPrice(alert.currentPrice)}</span>
                          <span className="font-bold text-emerald-600">{formatPrice(alert.targetPrice)}</span>
                          <Badge className={`text-[9px] rounded-lg ${alert.direction === 'below' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {alert.direction === 'below' ? 'Below target' : 'Above target'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => toggleAlert(alert.id, alert.status !== 'active')}>
                          {alert.status === 'active' ? <Bell className="h-4 w-4 text-royal" /> : <BellOff className="h-4 w-4 text-slate-300" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function renderListingsTab(favorites: FavoriteListing[], loading: boolean, removeFavorite: (id: string) => Promise<void>) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="rounded-2xl border-0 shadow-premium">
            <Skeleton className="h-44 rounded-t-2xl" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  if (favorites.length === 0) {
    return (
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
            <Heart className="h-7 w-7 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-navy">No favorites yet</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Browse listings and tap the heart icon to save your favorites here
          </p>
          <Link href="/">
            <Button className="mt-6 rounded-2xl bg-royal text-white border-0 shadow-lg shadow-royal/20">
              Browse Listings
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {favorites.map((listing) => (
        <Card key={listing.id} className="rounded-2xl border-0 shadow-premium card-hover overflow-hidden group">
          <div className="h-44 bg-slate-100 relative overflow-hidden">
            {listing.images?.length ? (
              <img src={listing.images[0]?.url} alt={listing.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="h-full flex items-center justify-center"><Star className="h-10 w-10 text-slate-200" /></div>
            )}
            <button onClick={() => removeFavorite(listing.id)} className="absolute top-3 right-3 h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-white hover:text-rose-600 transition-all shadow-sm">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <Badge variant="outline" className="absolute bottom-3 left-3 text-[9px] bg-white/90 backdrop-blur-sm border-0 rounded-lg">{listing.condition}</Badge>
          </div>
          <CardContent className="p-4">
            <Link href={`/listing/${listing.id}`}>
              <h3 className="font-semibold text-navy truncate hover:text-royal transition-colors">{listing.title}</h3>
            </Link>
            <p className="text-lg font-bold text-royal mt-1">{listing.currency} {listing.price?.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {listing.location?.name || 'Kenya'}</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {listing.views || 0}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
