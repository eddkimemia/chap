'use client'

import { Lock, Eye, Database, Shield, UserCheck, Bell, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/classifieds/header'
import { Footer } from '@/components/classifieds/footer'
import { MobileNav } from '@/components/classifieds/mobile-nav'

export default function PrivacyPage() {
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
              <Lock className="h-4 w-4" />
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Privacy <span className="text-electric-light">Policy</span>
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
          >
            {/* Key Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {[
                { icon: Shield, label: 'Data Protection', desc: 'Your data is encrypted and secured' },
                { icon: Eye, label: 'Transparency', desc: 'We tell you exactly what we collect' },
                { icon: UserCheck, label: 'Your Control', desc: 'You can delete your data anytime' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-white border border-slate-100 shadow-premium p-5 text-center">
                  <div className="h-10 w-10 mx-auto rounded-xl bg-royal/5 flex items-center justify-center mb-3">
                    <item.icon className="h-5 w-5 text-royal" />
                  </div>
                  <h3 className="text-sm font-bold text-navy mb-1">{item.label}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="prose prose-slate prose-lg max-w-none">
              <p>
                At ChapKE (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>

              <h2 className="text-2xl font-bold text-navy">1. Information We Collect</h2>

              <h3 className="text-xl font-bold text-navy">1.1 Information You Provide</h3>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, phone number, and password when you register</li>
                <li><strong>Profile Data:</strong> Avatar, bio, and location you choose to share</li>
                <li><strong>Listing Content:</strong> Images, descriptions, prices, and contact details for your listings</li>
                <li><strong>Communications:</strong> Messages sent through our platform and messages to our support team</li>
                <li><strong>Payment Information:</strong> Billing details for premium features (processed securely by our payment partners)</li>
              </ul>

              <h3 className="text-xl font-bold text-navy">1.2 Information Collected Automatically</h3>
              <ul>
                <li><strong>Device Information:</strong> Browser type, operating system, device type, and screen resolution</li>
                <li><strong>Usage Data:</strong> Pages viewed, features used, search queries, and interaction patterns</li>
                <li><strong>Location Data:</strong> Approximate location based on IP address (we do not collect precise GPS data without consent)</li>
                <li><strong>Cookies &amp; Tracking:</strong> We use cookies and similar technologies to enhance your experience and analyze usage</li>
              </ul>

              <h2 className="text-2xl font-bold text-navy">2. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul>
                <li>Provide, maintain, and improve our Services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative notifications (account verification, security alerts)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Personalize your experience and deliver relevant content</li>
                <li>Monitor and analyze usage patterns to improve the platform</li>
                <li>Detect, prevent, and address fraud and security issues</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-bold text-navy">3. Information Sharing</h2>
              <p>We do not sell your personal information. We may share information with:</p>
              <ul>
                <li><strong>Other Users:</strong> Your listing information and profile are visible to other users as necessary for the platform to function</li>
                <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform (hosting, analytics, payment processing)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect the rights and safety of ChapKE and its users</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with appropriate notice)</li>
              </ul>

              <h2 className="text-2xl font-bold text-navy">4. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data, including encryption in transit (TLS/SSL), encrypted storage, access controls, and regular security audits. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold text-navy">5. Data Retention</h2>
              <p>
                We retain your information for as long as your account is active or as needed to provide Services. When you delete your account, we will remove your personal data within 30 days, except where required by law or for legitimate business purposes (e.g., fraud prevention records).
              </p>

              <h2 className="text-2xl font-bold text-navy">6. Your Rights</h2>
              <p>Under Kenyan data protection law (Data Protection Act, 2019), you have the right to:</p>
              <ul>
                <li><strong>Access</strong> the personal information we hold about you</li>
                <li><strong>Correct</strong> inaccurate or incomplete information</li>
                <li><strong>Delete</strong> your personal information (subject to legal exceptions)</li>
                <li><strong>Object</strong> to certain processing of your data</li>
                <li><strong>Withdraw consent</strong> where processing is based on consent</li>
                <li><strong>Data Portability</strong> — receive your data in a structured, machine-readable format</li>
              </ul>
              <p>
                To exercise these rights, contact us at{' '}
                <a href="mailto:privacy@chap.co.ke" className="text-royal hover:underline">privacy@chap.co.ke</a>.
              </p>

              <h2 className="text-2xl font-bold text-navy">7. Children&apos;s Privacy</h2>
              <p>
                ChapKE is not intended for users under 18. We do not knowingly collect information from children. If you believe a child has provided us with personal data, contact us and we will promptly delete it.
              </p>

              <h2 className="text-2xl font-bold text-navy">8. Third-Party Links</h2>
              <p>
                Our platform may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>

              <h2 className="text-2xl font-bold text-navy">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or platform notification at least 30 days before the changes take effect. Your continued use of the Services constitutes acceptance of the updated policy.
              </p>

              <h2 className="text-2xl font-bold text-navy">10. Contact Us</h2>
              <p>
                For questions about this Privacy Policy, contact our Data Protection Officer at{' '}
                <a href="mailto:privacy@chap.co.ke" className="text-royal hover:underline">privacy@chap.co.ke</a>.
              </p>
              <p>
                ChapKE Ltd.<br />
                Nairobi, Kenya
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
