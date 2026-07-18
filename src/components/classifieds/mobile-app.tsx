'use client'

import { motion } from 'framer-motion'
import { Smartphone, Apple, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

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
                  <Apple className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/60">Download on the</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </Button>
              </a>
              <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
                <Button className="h-14 px-6 rounded-2xl bg-navy text-white hover:bg-navy/90 transition-all border-0 cursor-pointer">
                  <Smartphone className="h-6 w-6 mr-3" />
                  <div className="text-left">
                    <p className="text-[10px] text-white/60">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </Button>
              </a>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-royal flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Coming soon to</p>
                  <p className="text-xs font-semibold text-navy">App Stores</p>
                </div>
              </div>
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
