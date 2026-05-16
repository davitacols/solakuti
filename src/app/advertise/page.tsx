import type { Metadata } from "next";
import PublisherPage from "@/components/PublisherPage";

export const metadata: Metadata = {
  title: "Advertise With Solakuti",
  description: "Advertise and partner with Solakuti across Nigerian news, politics, business, culture and public affairs."
};

export default function AdvertisePage() {
  return (
    <PublisherPage
      eyebrow="Advertise"
      title="Reach a sharp Nigerian public-affairs audience."
      intro="Solakuti offers sponsorship, newsletter placements, display partnerships and clearly labeled branded content for relevant campaigns."
      cta={{ label: "Start a campaign", href: "mailto:ads@solakuti.com" }}
      sections={[
        {
          title: "Audience Fit",
          body: "Campaigns work best when they speak to readers interested in Nigerian public affairs, business, governance, security and culture."
        },
        {
          title: "Formats",
          body: "Available placements can include homepage sponsorship, category sponsorship, newsletter placement, social distribution and branded explainers."
        },
        {
          title: "Labeling",
          body: "Sponsored content is clearly disclosed. Solakuti keeps commercial content separate from newsroom editorial decisions."
        },
        {
          title: "Partnerships",
          body: "We can package campaign requirements, creative assets, publication dates and measurement expectations for partners."
        }
      ]}
    />
  );
}
