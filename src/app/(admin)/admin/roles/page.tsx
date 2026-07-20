'use client'

import { useState } from 'react'
import { Shield, ShieldCheck, ShieldOff, User, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const defaultPermissions = {
  users: { view: true, create: true, edit: true, delete: false, suspend: true, ban: true },
  listings: { view: true, create: true, edit: true, delete: true, approve: true, feature: true },
  categories: { view: true, create: true, edit: true, delete: true },
  locations: { view: true, create: true, edit: true, delete: true },
  payments: { view: true, refund: true, export: true },
  reports: { view: true, resolve: true, dismiss: true, warn: true, ban: true },
  plans: { view: true, create: true, edit: true, delete: true },
  banners: { view: true, create: true, edit: true, delete: true },
  cms: { view: true, create: true, edit: true, delete: true, publish: true },
  blog: { view: true, create: true, edit: true, delete: true, publish: true },
  settings: { view: true, edit: true },
  seo: { view: true, edit: true },
  analytics: { view: true, export: true },
}

const modules = [
  { key: 'users', label: 'User Management', icon: Users },
  { key: 'listings', label: 'Listing Management', icon: Shield },
  { key: 'categories', label: 'Categories', icon: Shield },
  { key: 'locations', label: 'Locations', icon: Shield },
  { key: 'payments', label: 'Payments', icon: Shield },
  { key: 'reports', label: 'Reports', icon: Shield },
  { key: 'plans', label: 'Subscription Plans', icon: Shield },
  { key: 'banners', label: 'Advertisements', icon: Shield },
  { key: 'cms', label: 'CMS Pages', icon: Shield },
  { key: 'blog', label: 'Blog', icon: Shield },
  { key: 'settings', label: 'System Settings', icon: Shield },
  { key: 'seo', label: 'SEO', icon: Shield },
  { key: 'analytics', label: 'Analytics', icon: Shield },
]

export default function AdminRolesPage() {
  const [roles, setRoles] = useState({
    admin: { label: 'Administrator', color: 'bg-red-500', permissions: defaultPermissions },
    moderator: { label: 'Moderator', color: 'bg-accent-red', permissions: Object.fromEntries(Object.entries(defaultPermissions).map(([key, perms]) => [key, Object.fromEntries(Object.entries(perms).map(([p, v]) => [p, key === 'settings' || key === 'seo' || key === 'plans' ? false : v]))])) },
    support: { label: 'Support Agent', color: 'bg-royal', permissions: Object.fromEntries(Object.entries(defaultPermissions).map(([key, perms]) => [key, Object.fromEntries(Object.entries(perms).map(([p, v]) => [p, key === 'users' || key === 'listings' || key === 'reports' || key === 'cms' || key === 'blog' ? v : false]))])) },
  })

  const togglePermission = (role: string, module: string, perm: string) => {
    setRoles((prev) => ({
      ...prev,
      [role]: {
        ...prev[role as keyof typeof prev],
        permissions: {
          ...prev[role as keyof typeof prev].permissions,
          [module]: {
            ...(prev[role as keyof typeof prev].permissions as Record<string, Record<string, boolean>>)[module],
            [perm]: !((prev[role as keyof typeof prev].permissions as Record<string, Record<string, boolean>>)[module]?.[perm]),
          },
        },
      },
    }))
    toast.success('Permission updated')
  }

  return (
    <div className="space-y-6 lg:pl-6">
      <div>
        <h1 className="text-2xl font-bold text-navy tracking-tight">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage role-based access control</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {Object.entries(roles).map(([key, role]) => (
          <Card key={key} className="rounded-2xl border-0 shadow-premium">
            <CardHeader className={`${role.color} rounded-t-2xl -m-0 p-4`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {key === 'admin' ? <ShieldCheck className="h-5 w-5 text-white" /> : key === 'moderator' ? <Shield className="h-5 w-5 text-white" /> : <User className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <CardTitle className="text-white text-base">{role.label}</CardTitle>
                  <p className="text-white/60 text-xs">Role: {key}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {modules.map((mod) => {
      const perms = (role.permissions as Record<string, Record<string, boolean>>)[mod.key]
                  if (!perms) return null
                  return (
                    <div key={mod.key}>
                      <p className="text-xs font-semibold text-navy mb-1.5 flex items-center gap-1.5"><mod.icon className="h-3 w-3 text-royal" />{mod.label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(perms).map(([perm, value]) => (
                          <button
                            key={perm}
                            onClick={() => togglePermission(key, mod.key, perm)}
                            className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                              value ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}
                          >
                            {perm}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
