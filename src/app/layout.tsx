import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "ChapKE";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chap.co.ke";
const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Kenya's premier digital marketplace for buying and selling vehicles, property, electronics, and more.";

export const metadata: Metadata = {
  title: `${siteName} — Kenya's Premier Digital Marketplace`,
  description: siteDescription,
  keywords: [
    "ChapKE",
    "Kenya marketplace",
    "Kenya classifieds",
    "buy and sell Kenya",
    "Nairobi marketplace",
    "digital marketplace Kenya",
    "vehicles Kenya",
    "property Kenya",
    "electronics Kenya",
    "jobs Kenya",
    "premium classifieds",
  ],
  authors: [{ name: siteName }],
  icons: {
    icon: "/fav.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteName,
  },
  openGraph: {
    title: `${siteName} — Kenya's Premier Digital Marketplace`,
    description: siteDescription,
    type: "website",
    siteName: siteName,
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Kenya's Premier Digital Marketplace`,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={siteName} />
      </head>
      <body
        className={`${manrope.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteName,
              url: siteUrl,
              description: siteDescription,
              sameAs: [
                process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/chapke',
                process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/chapke',
                process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/chapke',
              ].filter(Boolean),
            }),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
