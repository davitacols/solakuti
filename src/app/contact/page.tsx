import type { Metadata } from "next";
import PublisherPage from "@/components/PublisherPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Solakuti",
  description: "Contact Solakuti for news tips, corrections, partnerships, syndication and advertising.",
  path: "/contact"
});

export default function ContactPage() {
  return (
    <PublisherPage
      eyebrow="Contact"
      title="Reach the Solakuti newsroom."
      intro="Send news tips, corrections, partnership requests and distribution enquiries to the editorial team."
      cta={{ label: "Email Solakuti", href: "mailto:editorial@solakuti.com" }}
      sections={[
        {
          title: "Editorial Desk",
          body: "For news tips, corrections and source material, email editorial@solakuti.com with clear context, dates, names and supporting documents where available."
        },
        {
          title: "Partnerships",
          body: "For browser feeds, publisher partnerships, content syndication and platform onboarding, email partnerships@solakuti.com with your technical requirements."
        },
        {
          title: "Advertising",
          body: "For sponsorships, branded content and campaign enquiries, email ads@solakuti.com. Sponsored work is clearly labeled."
        },
        {
          title: "Corrections",
          body: "Correction requests should include the article URL, the disputed claim and verifiable supporting information."
        }
      ]}
    />
  );
}
