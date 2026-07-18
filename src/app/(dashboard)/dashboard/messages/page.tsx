'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Send, Search, ArrowLeft, Image as ImageIcon, Star, Paperclip,
  FileText, X, Phone, Video, AlertTriangle, Shield, Ban,
  MoreVertical, Flag, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'

interface Conversation {
  id: string; participantName: string; participantId: string
  lastMessage: string; lastMessageAt: string; unread: number
  listingTitle?: string; listingImage?: string; avatar?: string
}

interface Message {
  id: string; content: string; senderId: string; createdAt: string
  type: string; mediaUrl?: string; mediaType?: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [userId, setUserId] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachDialog, setAttachDialog] = useState(false)
  const [blockDialog, setBlockDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const currentUser = useAppStore((s) => s.currentUser)

  useEffect(() => {
    if (currentUser?.id) setUserId(currentUser.id)
    else {
      apiFetch('/api/auth/me')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.user?.id) setUserId(data.user.id)
        })
        .catch(() => {})
    }
    fetchConversations()
  }, [currentUser?.id])

  useEffect(() => {
    if (!selected) return
    fetchMessages(selected.id)
    const interval = setInterval(() => fetchMessages(selected.id), 3000)
    return () => clearInterval(interval)
  }, [selected])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  const fetchConversations = async () => {
    try {
      const res = await apiFetch('/api/messages/conversations')
      if (res.ok) { const d = await res.json(); setConversations(d.conversations || []) }
    } catch { toast.error('Failed to load conversations') } finally { setLoading(false) }
  }

  const fetchMessages = async (convId: string) => {
    try {
      const res = await apiFetch(`/api/messages/conversations/${convId}`)
      if (res.ok) { const d = await res.json(); setMessages(d.messages || []) }
    } catch { toast.error('Failed to load messages') }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selected) return
    setSending(true)
    try {
      const res = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ content: newMessage, conversationId: selected.id, type: 'text' }),
      })
      if (res.ok) { const d = await res.json(); setMessages((prev) => [...prev, d.message]); setNewMessage('') }
    } catch { toast.error('Failed to send message') } finally { setSending(false) }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selected) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversationId', selected.id)
    setSending(true)
    try {
      const res = await apiFetch('/api/messages/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) { const d = await res.json(); setMessages((prev) => [...prev, d.message]); toast.success('File sent') }
      else { toast.error('Upload failed') }
    } catch { toast.error('Upload failed') } finally { setSending(false); setAttachDialog(false) }
  }

  const handleBlockUser = async () => {
    if (!selected) return
    try {
      const res = await apiFetch(`/api/messages/block`, {
        method: 'POST',
        body: JSON.stringify({ userId: selected.participantId }),
      })
      if (res.ok) { toast.success(`${selected.participantName} has been blocked`); setBlockDialog(false); setSelected(null) }
      else { toast.error('Failed to block user') }
    } catch { toast.error('Failed to block user') }
  }

  const handleReportUser = async () => {
    if (!selected) return
    try {
      const res = await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify({ type: 'user', targetId: selected.participantId, reason: 'Inappropriate behavior' }),
      })
      if (res.ok) toast.success('User reported');
      else { const d = await res.json(); toast.error(d.error || 'Failed to report') }
    } catch { toast.error('Failed to report user') }
  }

  const filtered = conversations.filter((c) =>
    c.participantName?.toLowerCase().includes(search.toLowerCase()) ||
    c.listingTitle?.toLowerCase().includes(search.toLowerCase())
  )

  const showList = !isMobile || !selected
  const showThread = !isMobile || selected

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Card className="h-full rounded-2xl border-0 shadow-premium overflow-hidden flex">
        {/* Conversation List */}
        {showList && (
          <div className={`${isMobile ? 'w-full' : 'w-80'} flex flex-col border-r border-border`}>
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-bold text-navy mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl h-10 bg-muted/50 border-0" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-full" /></div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Send className="h-10 w-10 text-slate-200 mb-2" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                filtered.map((conv) => (
                  <button key={conv.id} onClick={() => setSelected(conv)}
                    className={`w-full flex gap-3 p-4 text-left transition-colors border-b border-border/50 hover:bg-muted/30 ${selected?.id === conv.id ? 'bg-muted/50' : ''}`}>
                    <div className="h-10 w-10 rounded-full bg-royal flex items-center justify-center text-white text-sm font-semibold shrink-0 relative">
                      {conv.participantName?.charAt(0)?.toUpperCase() || '?'}
                      {conv.unread > 0 && <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-navy truncate">{conv.participantName}</p>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}</span>
                      </div>
                      {conv.listingTitle && <p className="text-[10px] text-royal truncate">{conv.listingTitle}</p>}
                      <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Message Thread */}
        {showThread && (
          <div className="flex-1 flex flex-col">
            {selected ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border bg-white/50 backdrop-blur-sm">
                  {isMobile && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setSelected(null)}><ArrowLeft className="h-4 w-4" /></Button>}
                  <div className="h-9 w-9 rounded-full bg-royal flex items-center justify-center text-white text-xs font-semibold">
                    {selected.participantName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-navy">{selected.participantName}</p>
                    {selected.listingTitle && <p className="text-[11px] text-royal truncate">{selected.listingTitle}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400" title="Voice call">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400" title="Video call">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-44">
                        <DropdownMenuItem onClick={() => setAttachDialog(true)} className="rounded-lg"><Paperclip className="h-4 w-4 mr-2" /> Send File</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setBlockDialog(true)} className="rounded-lg text-red-600"><Ban className="h-4 w-4 mr-2" /> Block User</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleReportUser} className="rounded-lg text-red-600"><Flag className="h-4 w-4 mr-2" /> Report User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                  {messages.map((msg) => {
      const isOwn = msg.senderId === userId
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-royal text-white rounded-br-md' : 'bg-white text-navy shadow-sm rounded-bl-md'}`}>
                          {msg.type === 'image' && msg.mediaUrl ? (
                            <div className="mb-1">
                              <img src={msg.mediaUrl} alt="Shared image" className="max-w-full rounded-xl max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                            </div>
                          ) : msg.type === 'file' && msg.mediaUrl ? (
                            <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${isOwn ? 'bg-white/10' : 'bg-slate-50'} hover:opacity-80 transition-opacity`}>
                              <FileText className="h-5 w-5 shrink-0" />
                              <span className="text-xs truncate flex-1">{msg.content || 'File'}</span>
                              <Download className="h-3.5 w-3.5 shrink-0" />
                            </a>
                          ) : null}
                          {msg.content && (msg.type === 'text' || !msg.mediaUrl) && <p className="text-sm">{msg.content}</p>}
                          <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-border bg-white/50 backdrop-blur-sm">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-2xl h-11 bg-muted/50 border-0"
                    disabled={sending}
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-slate-400 shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleFileUpload} />
                  <Button type="submit" size="icon" disabled={!newMessage.trim() || sending} className="h-11 w-11 rounded-2xl bg-royal text-white shadow-lg shadow-royal/20 transition-all border-0 shrink-0">
                    <Send className={`h-4 w-4 ${sending ? 'animate-pulse' : ''}`} />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                    <Send className="h-7 w-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-navy">Select a conversation</p>
                  <p className="text-xs mt-1">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Block Dialog */}
      <Dialog open={blockDialog} onOpenChange={setBlockDialog}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ban className="h-5 w-5 text-red-500" /> Block User</DialogTitle>
            <DialogDescription>
              Are you sure you want to block {selected?.participantName}? They will not be able to message you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialog(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleBlockUser} className="rounded-xl gap-2"><Ban className="h-4 w-4" /> Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attach File Dialog */}
      <Dialog open={attachDialog} onOpenChange={setAttachDialog}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Send File</DialogTitle>
            <DialogDescription>Choose a file to share in this conversation</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {[
              { icon: ImageIcon, label: 'Photo', accept: 'image/*' },
              { icon: FileText, label: 'Document', accept: '.pdf,.doc,.docx' },
              { icon: X, label: 'Other', accept: '*' },
            ].map((opt) => (
              <button key={opt.label} onClick={() => { fileInputRef.current?.click(); setAttachDialog(false) }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 hover:border-royal/30 hover:bg-royal/5 transition-all">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <opt.icon className="h-5 w-5 text-royal" />
                </div>
                <span className="text-xs font-medium text-navy">{opt.label}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
