'use client'

import {
  Car,
  Home,
  Monitor,
  Smartphone,
  Shirt,
  Briefcase,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'

const iconMap: Record<string, React.ElementType> = {
  car: Car,
  home: Home,
  monitor: Monitor,
  smartphone: Smartphone,
  shirt: Shirt,
  briefcase: Briefcase,
}

export function Footer() {
  const { categories, locations } = useAppStore()
  const parentCategories = categories.filter((c) => !c.parentId)

  return (
    <footer className="mt-auto bg-navy text-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 py-16 relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Marketplace */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-2.5">
              <li><button onClick={() => useAppStore.getState().resetToHome()} className="text-sm text-white/50 hover:text-white transition-colors">Browse Listings</button></li>
              <li><button onClick={() => useAppStore.getState().setView('listings')} className="text-sm text-white/50 hover:text-white transition-colors">All Categories</button></li>
              <li><button onClick={() => { useAppStore.getState().setView('listings'); useAppStore.getState().setFilters({ location: 'nairobi' }) }} className="text-sm text-white/50 hover:text-white transition-colors">Nairobi</button></li>
              <li><button onClick={() => { useAppStore.getState().setView('listings'); useAppStore.getState().setFilters({ location: 'mombasa' }) }} className="text-sm text-white/50 hover:text-white transition-colors">Mombasa</button></li>
              <li><button onClick={() => { useAppStore.getState().setView('listings'); useAppStore.getState().setFilters({ location: 'kisumu' }) }} className="text-sm text-white/50 hover:text-white transition-colors">Kisumu</button></li>
              <li><Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors">Blog & Guides</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2.5">
              {parentCategories.slice(0, 6).map((cat) => {
                const Icon = iconMap[cat.icon] || Briefcase
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => useAppStore.getState().setSelectedCategory(cat.slug)}
                      className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                    >
                      <Icon className="h-3 w-3" />
                      {cat.name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5">
              {['About Us', 'Contact Us', 'Careers', 'Blog', 'Press Kit'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Support</h3>
            <ul className="space-y-2.5">
              {['Help Center', 'Safety Center', 'FAQ', 'Report Abuse', 'Contact Support'].map((link) => (
                <li key={link}>
                  <Link href={link === 'Help Center' ? '/help' : '#'} className="text-sm text-white/50 hover:text-white transition-colors">{link}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Community Guidelines'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Seller */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">For Sellers</h3>
            <ul className="space-y-2.5">
              <li><button onClick={() => useAppStore.getState().setShowPostAd(true)} className="text-sm text-white/50 hover:text-white transition-colors">Post an Ad</button></li>
              <li><Link href="/dashboard/listings" className="text-sm text-white/50 hover:text-white transition-colors">Seller Dashboard</Link></li>
              {['Pricing', 'Business Accounts', 'Advertising'].map((link) => (
                <li key={link}><a href="#" className="text-sm text-white/50 hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social + Payment + App */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="flex gap-3">
              {[{ Icon: Facebook, label: 'Facebook' }, { Icon: Twitter, label: 'Twitter' }, { Icon: Instagram, label: 'Instagram' }].map(({ Icon, label }) => (
                <a key={label} href="#" className="h-10 w-10 rounded-xl glass-card flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all" aria-label={label}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
              <a href="#" className="h-10 w-10 rounded-xl glass-card flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all" aria-label="TikTok">
                <Smartphone className="h-4 w-4" />
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40 justify-center">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Trusted by thousands of Kenyan buyers &amp; sellers</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-white/40">We Accept:</span>
              <div className="flex gap-1.5">
                {['Visa', 'M-Pesa', 'Airtel'].map((p) => (
                  <span key={p} className="text-[10px] bg-white/10 text-white/60 px-2 py-1 rounded-lg font-medium">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/30">
          <p>© 2026 ChapKE. Kenya&apos;s #1 Digital Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Made with</span>
            <span className="text-accent-orange">♥</span>
            <span>in Kenya</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
