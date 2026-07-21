'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BadgeCheck, Upload, Camera, Shield, CheckCircle2, AlertCircle,
  ArrowRight, ArrowLeft, FileText, User, Fingerprint, CreditCard,
  Building2, MapPin, Calendar, Globe, Loader2, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

import { apiFetch } from '@/lib/api-client'
type Step = 'intro' | 'personal' | 'document' | 'selfie' | 'review' | 'submitted'

export default function VerifyIdentityPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [progress, setProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const [personal, setPersonal] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '',
    nationality: 'Kenyan', idNumber: '', address: '', city: '',
    country: 'Kenya',
  })

  const [documents, setDocuments] = useState({
    idType: 'national_id', idFront: null as File | null, idFrontUrl: '',
    idBack: null as File | null, idBackUrl: '',
    selfie: null as File | null, selfieUrl: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const stepMap: Record<Step, number> = { intro: 0, personal: 25, document: 50, selfie: 75, review: 90, submitted: 100 }
    setProgress(stepMap[step])
  }, [step])

  const validatePersonal = () => {
    const errs: Record<string, string> = {}
    if (!personal.firstName.trim()) errs.firstName = 'Required'
    if (!personal.lastName.trim()) errs.lastName = 'Required'
    if (!personal.dateOfBirth) errs.dateOfBirth = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiFetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data.url
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const [idFrontUrl, idBackUrl, selfieUrl] = await Promise.all([
        documents.idFront ? uploadFile(documents.idFront) : Promise.resolve(''),
        documents.idBack ? uploadFile(documents.idBack) : Promise.resolve(''),
        documents.selfie ? uploadFile(documents.selfie) : Promise.resolve(''),
      ])

      const res = await apiFetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idType: documents.idType,
          idNumber: personal.idNumber,
          idFrontUrl,
          idBackUrl,
          selfieUrl,
        }),
      })
      if (res.ok) {
        setStep('submitted')
        toast.success('Verification submitted!')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to submit verification')
      }
    } catch { toast.error('Network error') } finally { setSubmitting(false) }
  }

  const idTypeOptions = [
    { value: 'national_id', label: 'National ID Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'drivers_license', label: 'Drivers License' },
    { value: 'alien_id', label: 'Alien ID Card' },
  ]

  if (step === 'submitted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
        <Card className="w-full max-w-lg glass-card shadow-premium-xl rounded-3xl border-0">
          <CardContent className="p-8 sm:p-10 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-navy">Verification Submitted</h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
              Your identity verification has been submitted successfully. Our team will review your documents within 24-48 hours.
            </p>
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  You will receive a notification once your verification is approved. In the meantime, you can continue using ChapKE with limited features.
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard')} className="mt-6 rounded-2xl bg-royal border-0 shadow-lg shadow-royal/20">
              Back to Dashboard <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-royal text-white shadow-lg shadow-royal/20 mb-4">
            <BadgeCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-navy tracking-tight">Verify Your Identity</h1>
          <p className="text-muted-foreground mt-1 text-sm">Complete your KYC to unlock all features</p>
        </div>

        <Progress value={progress} className="h-2 rounded-full bg-slate-200 [&>div]:bg-royal" />

        <Card className="rounded-3xl border-0 shadow-premium-xl">
          <CardContent className="p-6 sm:p-8">
            {step === 'intro' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-royal/10 mb-4">
                    <Shield className="h-8 w-8 text-royal" />
                  </div>
                  <h2 className="text-xl font-bold text-navy">Why verify your identity?</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Shield, title: 'Trust & Safety', desc: 'Build trust with buyers and sellers' },
                    { icon: Star, title: 'Verified Badge', desc: 'Get a verified badge on your profile' },
                    { icon: Upload, title: 'Higher Limits', desc: 'Post more listings and reach more buyers' },
                    { icon: CreditCard, title: 'Faster Payments', desc: 'Receive payments instantly' },
                  ].map((item) => (
                    <div key={item.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="h-9 w-9 rounded-xl bg-royal/10 flex items-center justify-center mb-2">
                        <item.icon className="h-5 w-5 text-royal" />
                      </div>
                      <h3 className="font-semibold text-navy text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800">Your documents are encrypted and securely stored. We never share your personal information with third parties without your consent.</p>
                  </div>
                </div>

                <Button onClick={() => setStep('personal')} className="w-full h-12 rounded-2xl bg-royal border-0 shadow-lg shadow-royal/20">
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </Button>

                <div className="text-center">
                  <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-navy transition-colors">
                    Skip for now
                  </Link>
                </div>
              </div>
            )}

            {step === 'personal' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-5 w-5 text-royal" />
                  <h2 className="text-xl font-bold text-navy">Personal Information</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">First Name</Label>
                    <Input value={personal.firstName} onChange={(e) => setPersonal((p) => ({ ...p, firstName: e.target.value }))} className={`h-11 rounded-xl bg-white border-slate-200 ${errors.firstName ? 'border-red-300' : ''}`} />
                    {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Last Name</Label>
                    <Input value={personal.lastName} onChange={(e) => setPersonal((p) => ({ ...p, lastName: e.target.value }))} className={`h-11 rounded-xl bg-white border-slate-200 ${errors.lastName ? 'border-red-300' : ''}`} />
                    {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Date of Birth</Label>
                    <Input type="date" value={personal.dateOfBirth} onChange={(e) => setPersonal((p) => ({ ...p, dateOfBirth: e.target.value }))} className={`h-11 rounded-xl bg-white border-slate-200 ${errors.dateOfBirth ? 'border-red-300' : ''}`} />
                    {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Gender</Label>
                    <select value={personal.gender} onChange={(e) => setPersonal((p) => ({ ...p, gender: e.target.value }))} className="h-11 w-full rounded-xl bg-white border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">National ID Number</Label>
                    <Input value={personal.idNumber} onChange={(e) => setPersonal((p) => ({ ...p, idNumber: e.target.value }))} placeholder="Enter your ID/Passport number" className={`h-11 rounded-xl bg-white border-slate-200 ${errors.idNumber ? 'border-red-300' : ''}`} />
                    {errors.idNumber && <p className="text-xs text-red-500">{errors.idNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Nationality</Label>
                    <Input value={personal.nationality} onChange={(e) => setPersonal((p) => ({ ...p, nationality: e.target.value }))} className="h-11 rounded-xl bg-white border-slate-200" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-navy font-medium">Address</Label>
                    <Textarea value={personal.address} onChange={(e) => setPersonal((p) => ({ ...p, address: e.target.value }))} placeholder="Your physical address" className="rounded-xl resize-none min-h-[60px]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">City</Label>
                    <Input value={personal.city} onChange={(e) => setPersonal((p) => ({ ...p, city: e.target.value }))} className="h-11 rounded-xl bg-white border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">Country</Label>
                    <Input value={personal.country} onChange={(e) => setPersonal((p) => ({ ...p, country: e.target.value }))} className="h-11 rounded-xl bg-white border-slate-200" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep('intro')} className="rounded-xl h-11 flex-1">Back</Button>
                  <Button onClick={() => { if (validatePersonal()) setStep('document') }} className="rounded-xl h-11 flex-1 bg-royal border-0">Continue</Button>
                </div>
              </div>
            )}

            {step === 'document' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-royal" />
                  <h2 className="text-xl font-bold text-navy">Upload Documents</h2>
                </div>

                <div className="space-y-2">
                  <Label className="text-navy font-medium">ID Type</Label>
                  <select value={documents.idType} onChange={(e) => setDocuments((p) => ({ ...p, idType: e.target.value }))} className="h-11 w-full rounded-xl bg-white border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20">
                    {idTypeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">ID Front</Label>
                    <label className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-royal/30 transition-all">
                      {documents.idFront ? (
                        <img src={URL.createObjectURL(documents.idFront)} alt="ID front" className="h-full w-full object-contain rounded-xl" />
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Upload front side</p>
                          <p className="text-[10px] text-slate-300 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setDocuments((p) => ({ ...p, idFront: f })) }} />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-navy font-medium">ID Back</Label>
                    <label className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-royal/30 transition-all">
                      {documents.idBack ? (
                        <img src={URL.createObjectURL(documents.idBack)} alt="ID back" className="h-full w-full object-contain rounded-xl" />
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-400">Upload back side</p>
                          <p className="text-[10px] text-slate-300 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setDocuments((p) => ({ ...p, idBack: f })) }} />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep('personal')} className="rounded-xl h-11 flex-1">Back</Button>
                  <Button onClick={() => setStep('selfie')} className="rounded-xl h-11 flex-1 bg-royal border-0">Continue</Button>
                </div>
              </div>
            )}

            {step === 'selfie' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <Camera className="h-5 w-5 text-royal" />
                  <h2 className="text-xl font-bold text-navy">Take a Selfie</h2>
                </div>

                <p className="text-sm text-muted-foreground">
                  Take a clear selfie holding your ID document next to your face. Make sure both your face and the ID are clearly visible.
                </p>

                <label className="flex flex-col items-center justify-center h-64 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-royal/30 transition-all">
                  {documents.selfie ? (
                    <img src={URL.createObjectURL(documents.selfie)} alt="Selfie photo" className="h-full w-full object-contain rounded-xl" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 font-medium">Tap to take a selfie</p>
                      <p className="text-xs text-slate-300 mt-1">Ensure good lighting and a neutral background</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setDocuments((p) => ({ ...p, selfie: f })) }} />
                </label>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep('document')} className="rounded-xl h-11 flex-1">Back</Button>
                  <Button onClick={() => setStep('review')} disabled={!documents.selfie} className="rounded-xl h-11 flex-1 bg-royal border-0">Continue</Button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <BadgeCheck className="h-5 w-5 text-royal" />
                  <h2 className="text-xl font-bold text-navy">Review & Submit</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-navy text-sm mb-2">Personal Details</h3>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="text-navy font-medium">{personal.firstName} {personal.lastName}</span></div>
                      <Separator />
                      <div className="flex justify-between"><span className="text-muted-foreground">Date of Birth</span><span className="text-navy font-medium">{personal.dateOfBirth}</span></div>
                      <Separator />
                      <div className="flex justify-between"><span className="text-muted-foreground">ID Number</span><span className="text-navy font-medium">{personal.idNumber}</span></div>
                      <Separator />
                      <div className="flex justify-between"><span className="text-muted-foreground">City</span><span className="text-navy font-medium">{personal.city || 'N/A'}</span></div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-navy text-sm mb-2">Documents</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(['idFront', 'idBack', 'selfie'] as const).map((key) => {
                        const file = documents[key]
                        return (
                          <div key={key} className="h-20 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                            {file ? <img src={URL.createObjectURL(file)} alt="Document preview" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-xs text-slate-300">Missing</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800">By submitting, you confirm that the information provided is accurate and your identity documents are genuine.</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setStep('selfie')} className="rounded-xl h-11 flex-1">Back</Button>
                  <Button onClick={handleSubmit} disabled={submitting} className="rounded-xl h-11 flex-1 bg-royal border-0 shadow-lg shadow-royal/20">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BadgeCheck className="h-4 w-4 mr-2" />}
                    {submitting ? 'Submitting...' : 'Submit Verification'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

