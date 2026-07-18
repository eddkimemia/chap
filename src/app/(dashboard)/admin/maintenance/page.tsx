'use client'

import { useState } from 'react'
import { Database, Download, Upload, RefreshCw, AlertTriangle, Server, HardDrive, Activity, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function AdminMaintenancePage() {
  const [backingUp, setBackingUp] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [caching, setCaching] = useState(false)

  const handleBackup = async () => {
    setBackingUp(true)
    // Simulate backup
    await new Promise((r) => setTimeout(r, 2000))
    toast.success('Database backup completed successfully')
    setBackingUp(false)
  }

  const handleCleanup = async () => {
    setCleaning(true)
    await new Promise((r) => setTimeout(r, 1500))
    toast.success('Cleanup completed: removed expired listings, old sessions, and temporary files')
    setCleaning(false)
  }

  const handleClearCache = async () => {
    setCaching(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('Cache cleared successfully')
    setCaching(false)
  }

  const stats = [
    { label: 'Database Size', value: '12.4 MB', icon: Database, color: 'text-royal' },
    { label: 'Total Records', value: '8,342', icon: Server, color: 'text-emerald-600' },
    { label: 'Cache Size', value: '2.1 MB', icon: HardDrive, color: 'text-accent-orange' },
    { label: 'Uptime', value: '14d 6h 32m', icon: Activity, color: 'text-accent-purple' },
  ]

  return (
    <div className="space-y-6 lg:pl-6">
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight">Backup & Maintenance</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage database backups and system health</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl border-0 shadow-premium">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-xl font-bold text-navy mt-1">{s.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 ${s.color}`}><s.icon className="h-5 w-5" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="text-navy text-lg font-bold flex items-center gap-2"><Database className="h-5 w-5 text-royal" /> Database Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Create a full backup of the database. This process may take a few moments depending on the database size.</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleBackup} disabled={backingUp} className="rounded-2xl bg-royal text-white border-0"><Download className="h-4 w-4 mr-1" /> {backingUp ? 'Backing up...' : 'Create Backup'}</Button>
              <Button variant="outline" className="rounded-2xl"><Upload className="h-4 w-4 mr-1" /> Restore Backup</Button>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground font-medium mb-1">Last backup</p>
              <p className="text-sm text-navy">Today at 3:42 AM · 12.4 MB · Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-premium">
          <CardHeader>
            <CardTitle className="text-navy text-lg font-bold flex items-center gap-2"><RefreshCw className="h-5 w-5 text-royal" /> System Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Perform routine maintenance tasks to keep the platform running smoothly.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-royal/5">
                <div>
                  <p className="text-sm font-medium text-navy">Cleanup Expired Data</p>
                  <p className="text-xs text-muted-foreground">Remove expired listings, old sessions, and stale data</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleCleanup} disabled={cleaning} className="rounded-xl shrink-0">{cleaning ? 'Cleaning...' : <><Trash2 className="h-4 w-4 mr-1" /> Clean</>}</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-royal/5">
                <div>
                  <p className="text-sm font-medium text-navy">Clear Cache</p>
                  <p className="text-xs text-muted-foreground">Flush all cached data and rebuild indexes</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearCache} disabled={caching} className="rounded-xl shrink-0">{caching ? 'Clearing...' : <><Activity className="h-4 w-4 mr-1" /> Clear</>}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 shadow-premium border-2 border-amber-200 bg-amber-50/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-navy">System Health Check</p>
              <p className="text-xs text-muted-foreground mt-0.5">All systems operational · Database connection: OK · Cache: OK · Storage: 67% used · Last health check: 2 minutes ago</p>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs rounded-lg shrink-0">Healthy</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
