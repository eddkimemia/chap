import { Wrench } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center max-w-md px-6">
        <div className="h-20 w-20 rounded-3xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
          <Wrench className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-navy mb-3">Under Maintenance</h1>
        <p className="text-slate-500 mb-8">
          We&apos;re performing scheduled maintenance to improve your experience. Please check back shortly.
        </p>
      </div>
    </div>
  )
}
