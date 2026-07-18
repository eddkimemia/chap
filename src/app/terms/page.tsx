'use client'

import { FileText, Shield, Scale, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy text-white">
        <div className="container mx-auto px-4 lg:px-8 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
              <Scale className="h-4 w-4" />
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Terms of <span className="text-electric-light">Service</span>
            </h1>
            <p className="text-lg text-white/60">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="prose prose-slate prose-lg max-w-none"
          >
            <div className="rounded-2xl bg-royal/5 border border-royal/10 p-6 mb-10 not-prose">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-royal mt-0.5 shrink-0" />
                <p className="text-sm text-slate-600">
                  By accessing or using ChapKE, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-navy">1. Acceptance of Terms</h2>
            <p>
              Welcome to ChapKE (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the ChapKE platform, including our website, mobile applications, and related services (collectively, the &ldquo;Services&rdquo;). By creating an account, accessing, or using our Services, you agree to comply with and be bound by these Terms.
            </p>

            <h2 className="text-2xl font-bold text-navy">2. Eligibility</h2>
            <p>
              You must be at least 18 years of age to use ChapKE. By using our Services, you represent and warrant that you meet this age requirement and have the legal capacity to enter into a binding agreement. If you are using the Services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>

            <h2 className="text-2xl font-bold text-navy">3. Account Registration</h2>
            <p>
              To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep your account credentials secure. You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use.
            </p>

            <h2 className="text-2xl font-bold text-navy">4. User Listings</h2>
            <p>
              ChapKE allows users to post listings for goods and services. You are solely responsible for the content, accuracy, and legality of your listings. Listings must not:
            </p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights of third parties</li>
              <li>Contain false, misleading, or deceptive information</li>
              <li>Promote illegal goods, services, or activities</li>
              <li>Contain malware, spam, or other harmful content</li>
            </ul>
            <p>
              We reserve the right to remove any listing that violates these Terms without notice.
            </p>

            <h2 className="text-2xl font-bold text-navy">5. Transactions</h2>
            <p>
              ChapKE facilitates connections between buyers and sellers. We are not a party to any transaction between users. You are responsible for verifying the identity of other users, the quality and safety of items, and the terms of any transaction. We do not guarantee the completion of any transaction.
            </p>

            <h2 className="text-2xl font-bold text-navy">6. Fees and Payments</h2>
            <p>
              Basic listing and browsing on ChapKE is free. Premium features, including featured listings and subscription plans, may require payment. All fees are non-refundable unless otherwise stated. We reserve the right to modify fees at any time with reasonable notice.
            </p>

            <h2 className="text-2xl font-bold text-navy">7. Intellectual Property</h2>
            <p>
              All content on ChapKE, including logos, text, graphics, and software, is the property of ChapKE or its licensors and is protected by applicable intellectual property laws. You may not copy, modify, distribute, or reverse-engineer any part of our Services without prior written consent.
            </p>

            <h2 className="text-2xl font-bold text-navy">8. Privacy</h2>
            <p>
              Your use of our Services is also governed by our{' '}
              <a href="/privacy" className="text-royal hover:underline">Privacy Policy</a>, which describes how we collect, use, and share your personal information. By using ChapKE, you consent to the data practices described in the Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-navy">9. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Services for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the platform</li>
              <li>Interfere with or disrupt the Services or servers</li>
              <li>Harass, threaten, or intimidate other users</li>
              <li>Use automated systems to access the Services without permission</li>
              <li>Circumvent any security features or access controls</li>
            </ul>

            <h2 className="text-2xl font-bold text-navy">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ChapKE shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services. Our total liability shall not exceed the greater of KES 1,000 or the amount you paid us in the twelve months preceding the claim.
            </p>

            <h2 className="text-2xl font-bold text-navy">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless ChapKE, its officers, directors, employees, and agents from any claims, losses, damages, liabilities, and expenses arising from your use of the Services or violation of these Terms.
            </p>

            <h2 className="text-2xl font-bold text-navy">12. Termination</h2>
            <p>
              We may suspend or terminate your account at any time for conduct that violates these Terms or is otherwise harmful to the platform or other users. Upon termination, your right to use the Services ceases immediately.
            </p>

            <h2 className="text-2xl font-bold text-navy">13. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email or platform notification. Your continued use of the Services after changes take effect constitutes acceptance of the updated Terms.
            </p>

            <h2 className="text-2xl font-bold text-navy">14. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the Republic of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.
            </p>

            <h2 className="text-2xl font-bold text-navy">15. Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@chapke.co.ke" className="text-royal hover:underline">legal@chapke.co.ke</a> or visit our{' '}
              <a href="/help" className="text-royal hover:underline">Help Center</a>.
            </p>
          </motion.div>
        </div>
      </div>

      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
