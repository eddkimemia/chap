'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Send, Search, ArrowLeft, Image as ImageIcon,
  Ban, Check, CheckCheck, Trash2, ExternalLink,
  MoreVertical, Flag, Mic, MicOff, Play, Pause,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'

interface Conversation {
  id: string; participantName: string; participantId: string; participantUsername?: string
  lastMessage: string; lastMessageAt: string; unread: number
  listingTitle?: string; listingImage?: string; avatar?: string
}

interface Message {
  id: string; content: string; senderId: string; createdAt: string
  type: string; mediaUrl?: string; mediaType?: string; isRead: boolean
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const day = 86400000

  if (diff < day) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (diff < 2 * day) {
    return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }
  if (diff < 7 * day) {
    return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const day = 86400000

  if (diff < day) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 2 * day) return 'Yesterday'
  if (diff < 7 * day) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
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
  const [blockDialog, setBlockDialog] = useState(false)
  const [deleteConvDialog, setDeleteConvDialog] = useState(false)
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
        .catch((error) => console.error('Failed to fetch auth user:', error))
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selected) return

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed')
      return
    }
    if (file.size > 1024 * 1024) {
      toast.error('Image must be under 1MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversationId', selected.id)
    setSending(true)
    try {
      const res = await apiFetch('/api/messages/upload', { method: 'POST', body: formData })
      if (res.ok) { const d = await res.json(); setMessages((prev) => [...prev, d.message]) }
      else { const d = await res.json(); toast.error(d.error || 'Upload failed') }
    } catch { toast.error('Upload failed') } finally { setSending(false) }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        if (!selected) return

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (audioBlob.size > 5 * 1024 * 1024) {
          toast.error('Voice message must be under 5MB')
          return
        }

        const formData = new FormData()
        formData.append('file', audioBlob, 'voice.webm')
        formData.append('conversationId', selected.id)
        formData.append('type', 'voice')
        setSending(true)
        try {
          const res = await apiFetch('/api/messages/upload', { method: 'POST', body: formData })
          if (res.ok) { const d = await res.json(); setMessages((prev) => [...prev, d.message]) }
          else { toast.error('Failed to send voice message') }
        } catch { toast.error('Failed to send voice message') } finally { setSending(false) }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      recordingTimerRef.current = setInterval(() => { setRecordingTime((t) => t + 1) }, 1000)
    } catch {
      toast.error('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    setRecordingTime(0)
  }

  const playAudio = (url: string) => {
    if (playingAudio === url) {
      audioRef.current?.pause()
      setPlayingAudio(null)
      return
    }
    if (audioRef.current) audioRef.current.pause()
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => setPlayingAudio(null)
    audio.play()
    setPlayingAudio(url)
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

  const handleDeleteConversation = async () => {
    if (!selected) return
    try {
      const res = await apiFetch(`/api/messages/${selected.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Conversation deleted')
        setConversations((prev) => prev.filter((c) => c.id !== selected.id))
        setSelected(null)
        setDeleteConvDialog(false)
      } else { toast.error('Failed to delete conversation') }
    } catch { toast.error('Failed to delete conversation') }
  }

  const handleDeleteMessage = async (msgId: string) => {
    try {
      const res = await apiFetch(`/api/messages/message/${msgId}`, { method: 'DELETE' })
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== msgId))
        setDeleteMsgId(null)
      } else { toast.error('Failed to delete message') }
    } catch { toast.error('Failed to delete message') }
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

  const filtered = conversations
    .filter((c) =>
      c.participantName?.toLowerCase().includes(search.toLowerCase()) ||
      c.listingTitle?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((c) => (showUnreadOnly ? c.unread > 0 : true))

  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0)

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Card className="h-full rounded-2xl border-0 shadow-premium overflow-hidden flex flex-row">
        {/* Conversation List */}
        <div className={`${
          selected && isMobile ? 'hidden' : 'flex'
        } w-full md:w-60 md:flex xl:w-72 2xl:w-80 flex-col border-r border-border shrink-0`}>
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-navy mb-3">Messages</h2>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl h-10 bg-muted/50 border-0" />
            </div>
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                showUnreadOnly ? 'bg-royal text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <Send className="h-3 w-3" />
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
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
                <p className="text-sm">{showUnreadOnly ? 'No unread conversations' : 'No conversations yet'}</p>
              </div>
            ) : (
              filtered.map((conv) => (
                <button key={conv.id} onClick={() => setSelected(conv)}
                  className={`w-full flex gap-3 p-4 text-left transition-colors border-b border-border/50 hover:bg-muted/30 ${selected?.id === conv.id ? 'bg-muted/50' : conv.unread > 0 ? 'bg-royal/[0.02]' : ''}`}>
                  <div className="h-10 w-10 rounded-full bg-royal flex items-center justify-center text-white text-sm font-semibold shrink-0 relative">
                    {conv.participantName?.charAt(0)?.toUpperCase() || '?'}
                    {conv.unread > 0 && <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-navy truncate">{conv.participantName}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {conv.lastMessageAt ? formatDate(conv.lastMessageAt) : ''}
                      </span>
                    </div>
                    {conv.listingTitle && <p className="text-[10px] text-royal truncate">{conv.listingTitle}</p>}
                    <p className={`text-xs truncate mt-0.5 ${conv.unread > 0 ? 'font-medium text-navy' : 'text-slate-400'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className={`${
          !selected && isMobile ? 'hidden' : 'flex'
        } flex-1 md:flex min-w-0`}>
          {selected ? (
            <>
              {/* Chat */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border bg-white/50 backdrop-blur-sm">
                  {isMobile && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0" onClick={() => setSelected(null)}><ArrowLeft className="h-4 w-4" /></Button>}
                  <div className="h-9 w-9 rounded-full bg-royal flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {selected.participantName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-navy">{selected.participantName}</p>
                      {selected.listingTitle && <p className="text-[11px] text-royal truncate">{selected.listingTitle}</p>}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                        <DropdownMenuItem asChild className="rounded-lg">
                          <Link href={`/seller/${selected.participantUsername || selected.participantId}`} className="flex items-center gap-2"><ExternalLink className="h-4 w-4" /> See Seller Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteConvDialog(true)} className="rounded-lg text-red-600"><Trash2 className="h-4 w-4 mr-2" /> Delete Conversation</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setBlockDialog(true)} className="rounded-lg text-red-600"><Ban className="h-4 w-4 mr-2" /> Block User</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleReportUser} className="rounded-lg text-red-600"><Flag className="h-4 w-4 mr-2" /> Report User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Messages (scrollable) */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === userId
                      return (
                        <div key={msg.id} className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          {isOwn && (
                            <button
                              onClick={() => setDeleteMsgId(msg.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 self-end mb-1 mr-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-royal text-white rounded-br-md' : 'bg-white text-navy shadow-sm rounded-bl-md'}`}>
                            {msg.type === 'image' && msg.mediaUrl ? (
                              <div className="mb-1">
                                <img src={msg.mediaUrl} alt="" className="max-w-full rounded-xl max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                              </div>
                            ) : msg.type === 'voice' && msg.mediaUrl ? (
                              <div className="flex items-center gap-2 mb-1">
                                <button
                                  onClick={() => playAudio(msg.mediaUrl!)}
                                  className={`h-8 w-8 rounded-full flex items-center justify-center ${isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-royal/10 hover:bg-royal/20'} transition-colors`}
                                >
                                  {playingAudio === msg.mediaUrl ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </button>
                                <div className="h-1.5 flex-1 rounded-full bg-current opacity-20 max-w-[80px]" />
                              </div>
                            ) : null}
                            {msg.content && (msg.type === 'text' || !msg.mediaUrl) && <p className="text-sm">{msg.content}</p>}
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-slate-400'}`}>
                                {formatTime(msg.createdAt)}
                              </span>
                              {isOwn && (
                                msg.isRead
                                  ? <CheckCheck className="h-3 w-3 text-blue-300" />
                                  : <Check className="h-3 w-3 text-white/60" />
                              )}
                            </div>
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
                      disabled={sending || isRecording}
                    />
                    {isRecording ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-red-500 font-medium animate-pulse">
                          {String(recordingTime).padStart(2, '0')}s
                        </span>
                        <Button type="button" size="icon" onClick={stopRecording} className="h-11 w-11 rounded-2xl bg-red-500 text-white border-0">
                          <MicOff className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-slate-400 shrink-0" onClick={startRecording} disabled={sending}>
                        <Mic className="h-4 w-4" />
                      </Button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || sending} className="h-11 w-11 rounded-2xl bg-royal text-white shadow-lg shadow-royal/20 transition-all border-0 shrink-0">
                      <Send className={`h-4 w-4 ${sending ? 'animate-pulse' : ''}`} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
                    <Send className="h-7 w-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-navy">Select a conversation</p>
                  <p className="text-xs mt-1">Choose from your existing conversations</p>
                </div>
              </div>
            )}
          </div>
      </Card>

      {/* Delete Conversation Dialog */}
      <Dialog open={deleteConvDialog} onOpenChange={setDeleteConvDialog}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-red-500" /> Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? All messages will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConvDialog(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConversation} className="rounded-xl gap-2"><Trash2 className="h-4 w-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Message Dialog */}
      <Dialog open={!!deleteMsgId} onOpenChange={(o) => !o && setDeleteMsgId(null)}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-red-500" /> Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMsgId(null)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMsgId && handleDeleteMessage(deleteMsgId)} className="rounded-xl gap-2"><Trash2 className="h-4 w-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </div>
  )
}
