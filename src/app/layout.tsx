import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { getCategories } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://solakuti.com";
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Solakuti | Premium Nigerian News and Media",
    template: "%s | Solakuti"
  },
  description:
    "Solakuti is a modern Nigerian digital newsroom covering politics, economy, security, entertainment, opinions and breaking news.",
  openGraph: {
    title: "Solakuti | Premium Nigerian News and Media",
    description:
      "A premium modern African digital newsroom for sharp reporting, analysis and culture.",
    url: SITE_URL,
    siteName: "Solakuti",
    images: [
      {
        url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Solakuti newsroom placeholder"
      }
    ],
    locale: "en_NG",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Solakuti",
    description: "Premium Nigerian news, analysis and culture.",
    images: [
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  robots: "index, follow, max-image-preview:large",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  verification: GOOGLE_SITE_VERIFICATION
    ? {
        google: GOOGLE_SITE_VERIFICATION
      }
    : undefined,
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
      "application/xml": `${SITE_URL}/news-sitemap.xml`
    }
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navCategories = await getCategories();

  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5089730714682068"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Analytics />
        <Navbar navCategories={navCategories} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
