import type { Metadata } from "next"
import { LandingPageClient } from "@/components/landing/LandingPageClient"

export const metadata: Metadata = {
  title: "PayrollX - Instant Payroll on Solana | Enterprise Blockchain Payroll",
  description: "Enterprise-grade payroll infrastructure powered by Solana blockchain. MPC security, instant USDC settlements, sub-second finality. Modernize your payroll with blockchain technology.",
  keywords: [
    "payroll",
    "solana",
    "blockchain",
    "crypto payroll",
    "USDC payroll",
    "MPC wallet",
    "enterprise payroll",
    "blockchain payments",
    "decentralized payroll",
    "instant settlements",
    "payroll automation",
    "crypto payments",
  ],
  icons: {
    icon: "/px-logo.svg",
    shortcut: "/px-logo.svg",
    apple: "/px-logo.svg",
  },
  authors: [{ name: "PayrollX Team" }],
  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "PayrollX - Instant Payroll on Solana | Enterprise Blockchain Payroll",
    description: "Enterprise-grade payroll infrastructure powered by Solana blockchain. MPC security, instant USDC settlements, sub-second finality.",
    siteName: "PayrollX",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PayrollX - Blockchain Payroll on Solana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PayrollX - Instant Payroll on Solana",
    description: "Enterprise-grade payroll infrastructure powered by Solana blockchain. MPC security, instant USDC settlements.",
    creator: "@payrollx",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
}

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PayrollX",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: "Enterprise-grade payroll infrastructure powered by Solana blockchain. MPC security, instant USDC settlements, sub-second finality.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://payrollx.com",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "50",
    },
    featureList: [
      "Sub-second settlement times",
      "MPC wallet security",
      "USDC and SOL support",
      "Global payments",
      "Automated compliance",
      "Immutable audit trails",
    ],
  }

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PayrollX",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://payrollx.com",
    logo: {
      "@type": "ImageObject",
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://payrollx.com"}/px-logo.svg`,
      width: 32,
      height: 32,
    },
    description: "Enterprise blockchain-based payroll disbursement platform on Solana",
    sameAs: [
      "https://github.com/Block-Horizon/PayrollX-Solana",
      "https://twitter.com/ramkumar_9301",
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <main className="bg-[#09090b] min-h-screen">
        <LandingPageClient />
      </main>
    </>
  )
}
