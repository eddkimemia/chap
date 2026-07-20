'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

function AppStoreIcon() {
  return (
    <svg className="h-6 w-6 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="white"/>
    </svg>
  )
}

function PlayStoreIcon() {
  return (
    <svg className="h-6 w-6 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 20.5V3.5c0-.5.25-.93.62-1.2l.1-.05 9.6 9.6v.3L3.72 21.75l-.1-.05C3.25 21.43 3 21 3 20.5z" fill="#EA4335"/>
      <path d="M17.6 15.5l-4.88-2.8v-.3l4.87-2.8.09.05c.43.25.72.7.72 1.22v3.46c0 .5-.29.95-.72 1.2l-.08.07z" fill="#FBBC04"/>
      <path d="M3.72 21.75l9.6-9.6L3.72 2.25C3.25 2.57 3 3 3 3.5v17c0 .5.25.93.72 1.25z" fill="#4285F4"/>
      <path d="M6.95 19.15L17.63 15.5c.45-.25.73-.7.73-1.2v-.17l-8.35-8.36c-.25-.28-.65-.4-1.05-.27-.36.12-.6.45-.6.84v12.14c0 .38.23.71.59.82z" fill="none"/>
    </svg>
  )
}

export function MobileApp() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold text-royal tracking-wider uppercase mb-2">Mobile App</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">Buy & Sell on the Go</h2>
            <p className="text-slate-400 mb-8 max-w-md leading-relaxed">
              Download the ChapKE app for a faster, smoother experience. Browse listings, chat with sellers, and post ads right from your phone.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
                <Button className="h-14 px-6 rounded-2xl bg-navy text-white hover:bg-navy/90 transition-all border-0 cursor-pointer">
                  <AppStoreIcon />
                  <div className="text-left">
                    <p className="text-[10px] text-white/60">Download on the</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </Button>
              </a>
              <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
                <Button className="h-14 px-6 rounded-2xl bg-navy text-white hover:bg-navy/90 transition-all border-0 cursor-pointer">
                  <PlayStoreIcon />
                  <div className="text-left">
                    <p className="text-[10px] text-white/60">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </Button>
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <Image
              src="/phoneapp.png"
              alt="ChapKE Mobile App"
              width={320}
              height={640}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
