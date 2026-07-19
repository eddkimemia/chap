'use client'

import {
  Car,
  Home,
  Monitor,
  Smartphone,
  Shirt,
  Briefcase,
  MapPin,
  ShieldCheck,
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
  const { categories } = useAppStore()
  const parentCategories = categories.filter((c) => !c.parentId)

  return (
    <footer className="mt-auto bg-navy text-white relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 py-16 relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Marketplace */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-2.5">
              <li><Link href="/search" className="text-sm text-white/50 hover:text-white transition-colors">Browse Listings</Link></li>
              <li><Link href="/search" className="text-sm text-white/50 hover:text-white transition-colors">All Categories</Link></li>
              <li><Link href="/location/nairobi" className="text-sm text-white/50 hover:text-white transition-colors">Nairobi</Link></li>
              <li><Link href="/location/mombasa" className="text-sm text-white/50 hover:text-white transition-colors">Mombasa</Link></li>
              <li><Link href="/location/kisumu" className="text-sm text-white/50 hover:text-white transition-colors">Kisumu</Link></li>
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
                    <Link href={`/category/${cat.slug}`} className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                      <Icon className="h-3 w-3" />
                      {cat.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="text-sm text-white/50 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Support</h3>
            <ul className="space-y-2.5">
              <li><Link href="/help" className="text-sm text-white/50 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/help" className="text-sm text-white/50 hover:text-white transition-colors">Safety Center</Link></li>
              <li><Link href="/help" className="text-sm text-white/50 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm text-white/50 hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Seller */}
          <div>
            <h3 className="font-bold mb-4 text-white/90 text-xs uppercase tracking-wider">For Sellers</h3>
            <ul className="space-y-2.5">
              <li><button onClick={() => useAppStore.getState().setShowPostAd(true)} className="text-sm text-white/50 hover:text-white transition-colors">Post an Ad</button></li>
              <li><Link href="/dashboard/listings" className="text-sm text-white/50 hover:text-white transition-colors">Seller Dashboard</Link></li>
              <li><Link href="/dashboard/orders" className="text-sm text-white/50 hover:text-white transition-colors">Premium Plans</Link></li>
            </ul>
          </div>
        </div>

        {/* Social + Trust */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="flex gap-3">
              <a href="https://facebook.com/chapke" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl flex items-center justify-center transition-all" style={{ backgroundColor: '#1877F2' }} aria-label="Facebook">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://twitter.com/chapke" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl flex items-center justify-center transition-all" style={{ backgroundColor: '#000' }} aria-label="Twitter">
                <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com/chapke" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl flex items-center justify-center transition-all" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }} aria-label="Instagram">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://youtube.com/@chapke" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl flex items-center justify-center transition-all" style={{ backgroundColor: '#FF0000' }} aria-label="YouTube">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
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
        </div>
      </div>
    </footer>
  )
}
