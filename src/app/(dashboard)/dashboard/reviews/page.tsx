'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, ThumbsUp, MessageSquare, Flag, Filter, Search, ChevronDown, User, Clock, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { timeAgo } from '@/lib/format'

import { apiFetch } from '@/lib/api-client'

interface Review {
  id: string
  rating: number
  title: string
  content: string
  createdAt: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  reply?: { content: string; createdAt: string }
  reviewer: { id: string; name: string; avatar?: string }
  listing: { id: string; title: string }
}

interface RatingBreakdown {
  stars: Record<number, number>
  total: number
  average: number
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [breakdown, setBreakdown] = useState<RatingBreakdown | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [activeTab, setActiveTab] = useState('received')
  const [replyDialog, setReplyDialog] = useState<{ open: boolean; reviewId: string }>({ open: false, reviewId: '' })
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ tab: activeTab })
      if (ratingFilter !== 'all') params.set('rating', ratingFilter)
      if (sortBy) params.set('sort', sortBy)
      const res = await apiFetch(`/api/reviews?${params}`)
      if (res.ok) {
      const data = await res.json()
        setReviews(data.reviews || [])
        setBreakdown(data.breakdown || null)
      }
    } catch { toast.error('Failed to load reviews') } finally { setLoading(false) }
  }, [activeTab, ratingFilter, sortBy])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  const filtered = reviews.filter((r) =>
    r.content?.toLowerCase().includes(search.toLowerCase()) ||
    r.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.reviewer?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleReply = async () => {
    if (!replyText.trim()) return toast.error('Reply cannot be empty')
    setSending(true)
    try {
      const res = await apiFetch(`/api/reviews/${replyDialog.reviewId}/reply`, {
        method: 'POST', body: JSON.stringify({ content: replyText }),
      })
      if (res.ok) { toast.success('Reply posted'); setReplyDialog({ open: false, reviewId: '' }); setReplyText(''); fetchReviews() }
      else { const d = await res.json(); throw new Error(d.error) }
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'An error occurred') } finally { setSending(false) }
  }

  const handleReportReview = async (reviewId: string) => {
    try {
      const res = await apiFetch('/api/reports', { method: 'POST', body: JSON.stringify({ type: 'review', targetId: reviewId, reason: 'Inappropriate content' }) })
      if (res.ok) toast.success('Review reported')
      else { const d = await res.json(); throw new Error(d.error) }
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'An error occurred') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reviews & Ratings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage reviews and feedback</p>
        </div>
        {breakdown && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(breakdown.average) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`} />
              ))}
            </div>
            <span className="text-lg font-bold text-amber-700">{breakdown.average.toFixed(1)}</span>
            <span className="text-xs text-amber-500">({breakdown.total} reviews)</span>
          </div>
        )}
      </div>

      {/* Rating Breakdown */}
      {breakdown && (
        <Card className="rounded-2xl border-0 shadow-premium">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-navy">{breakdown.average.toFixed(1)}</div>
                <div className="flex items-center gap-0.5 mt-1 justify-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-4 w-4 ${s <= Math.round(breakdown.average) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">{breakdown.total} total reviews</p>
              </div>
              <Separator orientation="vertical" className="h-20 hidden sm:block" />
              <div className="flex-1 w-full space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
      const count = breakdown.stars[star] || 0
      const pct = breakdown.total > 0 ? (count / breakdown.total) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500 w-6 text-right">{star}</span>
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-slate-400 text-xs w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs & Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="rounded-2xl bg-muted p-1">
            <TabsTrigger value="received" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Star className="h-4 w-4" /> Received
            </TabsTrigger>
            <TabsTrigger value="given" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <User className="h-4 w-4" /> Given
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Clock className="h-4 w-4" /> Pending
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-sm w-48" />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="h-10 w-32 rounded-xl bg-white border-slate-200 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1" /><SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 w-36 rounded-xl bg-white border-slate-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="received" className="mt-6 space-y-4">
          {renderReviewList(filtered, loading, 'received', setReplyDialog, handleReportReview)}
        </TabsContent>
        <TabsContent value="given" className="mt-6 space-y-4">
          {renderReviewList(filtered, loading, 'given', setReplyDialog, handleReportReview)}
        </TabsContent>
        <TabsContent value="pending" className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
            </div>
          ) : (
            <Card className="rounded-2xl border-0 shadow-premium">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare className="h-12 w-12 text-slate-200 mb-3" />
                <h3 className="text-lg font-bold text-navy">No pending reviews</h3>
                <p className="text-sm text-slate-400 mt-1">Reviews you need to respond to will appear here</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={replyDialog.open} onOpenChange={(o) => setReplyDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>Respond to this reviewer publicly</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="rounded-xl min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-slate-400 text-right">{replyText.length}/500</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialog({ open: false, reviewId: '' })} className="rounded-xl">Cancel</Button>
            <Button onClick={handleReply} disabled={sending || !replyText.trim()} className="rounded-xl bg-royal border-0">
              {sending ? 'Posting...' : 'Post Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function renderReviewList(
  reviews: Review[],
  loading: boolean,
  tab: string,
  setReplyDialog: (v: { open: boolean; reviewId: string }) => void,
  handleReportReview: (id: string) => void,
) {
  if (loading) {
    return <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
  }
  if (!reviews.length) {
    return (
      <Card className="rounded-2xl border-0 shadow-premium">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Star className="h-12 w-12 text-slate-200 mb-3" />
          <h3 className="text-lg font-bold text-navy">No reviews yet</h3>
          <p className="text-sm text-slate-400 mt-1">{tab === 'received' ? 'Reviews from buyers will appear here' : 'Reviews you have written will appear here'}</p>
        </CardContent>
      </Card>
    )
  }
  return reviews.map((review) => (
    <Card key={review.id} className="rounded-2xl border-0 shadow-premium card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 rounded-xl">
              <AvatarImage src={review.reviewer?.avatar} />
              <AvatarFallback className="rounded-xl bg-royal text-white text-sm">{review.reviewer?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-navy text-sm">{review.reviewer?.name || 'Anonymous'}</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                {review.isVerifiedPurchase && (
                  <Badge className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200 rounded-lg">Verified Purchase</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {review.listing?.title && <>on <span className="text-royal">{review.listing.title}</span> &middot; </>}
                {timeAgo(review.createdAt)}
              </p>
              {review.title && <p className="text-sm font-semibold text-navy mt-2">{review.title}</p>}
              <p className="text-sm text-slate-500 mt-1">{review.content}</p>
              {review.reply && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-3 w-3 text-royal" />
                    <span className="text-xs font-semibold text-royal">Your reply</span>
                    <span className="text-[10px] text-slate-400">{timeAgo(review.reply.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{review.reply.content}</p>
                </div>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-44">
              {!review.reply && tab === 'received' && (
                <DropdownMenuItem onClick={() => setReplyDialog({ open: true, reviewId: review.id })} className="rounded-lg">
                  <MessageSquare className="h-4 w-4 mr-2" /> Reply
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleReportReview(review.id)} className="rounded-lg text-red-600">
                <Flag className="h-4 w-4 mr-2" /> Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <button className="flex items-center gap-1 hover:text-royal transition-colors">
            <ThumbsUp className="h-3.5 w-3.5" /> {review.helpfulCount || 0}
          </button>
        </div>
      </CardContent>
    </Card>
  ))
}
