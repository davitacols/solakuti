import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
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
    url: "https://solakuti.example.com",
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
    description: "Premium Nigerian news, analysis and culture."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
