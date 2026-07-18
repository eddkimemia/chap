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

export const metadata: Metadata = {
  title: "ChapKE — Kenya's Premier Digital Marketplace",
  description:
    "The most trusted platform for buying and selling across Kenya. Vehicles, property, electronics, and more — powered by cutting-edge technology.",
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
  authors: [{ name: "ChapKE" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChapKE",
  },
  openGraph: {
    title: "ChapKE — Kenya's Premier Digital Marketplace",
    description:
      "The most trusted platform for buying and selling across Kenya. Powered by cutting-edge technology.",
    type: "website",
    siteName: "ChapKE",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChapKE — Kenya's Premier Digital Marketplace",
    description:
      "The most trusted platform for buying and selling across Kenya. Powered by cutting-edge technology.",
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
        <meta name="apple-mobile-web-app-title" content="ChapKE" />
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
              name: 'ChapKE',
              url: 'https://chapke.co.ke',
              logo: 'https://chapke.co.ke/logo.svg',
              description:
                "Kenya's premier digital marketplace for buying and selling vehicles, property, electronics, and more.",
              sameAs: [
                'https://facebook.com/chapke',
                'https://twitter.com/chapke',
                'https://instagram.com/chapke',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+254-XXX-XXX-XXX',
                contactType: 'customer support',
                availableLanguage: ['English', 'Swahili'],
              },
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
