import type { Metadata } from "next";
import PublisherPage from "@/components/PublisherPage";

export const metadata: Metadata = {
  title: "About Solakuti",
  description: "About Solakuti, a premium Nigerian digital newsroom for public-interest reporting and analysis."
};

export default function AboutPage() {
  return (
    <PublisherPage
      eyebrow="About the newsroom"
      title="Independent Nigerian reporting built for a faster news cycle."
      intro="Solakuti is a modern African digital newsroom covering Nigerian politics, public affairs, economy, security, culture and opinion with clarity, speed and editorial judgment."
      cta={{ label: "Contact editorial", href: "/contact" }}
      sections={[
        {
          title: "What We Cover",
          body: "We publish public-interest reporting across politics, general news, world news, crime, economy, security, entertainment, opinions and national affairs."
        },
        {
          title: "Editorial Standard",
          body: "Our reporting is written for readers who need context before commentary. We prioritize accuracy, attribution, useful background and clear headlines."
        },
        {
          title: "Distribution Ready",
          body: "Solakuti provides RSS feeds, a news sitemap, structured article data, Open Graph previews and clean canonical article URLs for discovery platforms."
        },
        {
          title: "Audience",
          body: "Our primary audience is Nigerian and African readers who follow public affairs, civic issues, business, security and culture across web and mobile channels."
        }
      ]}
    />
  );
}
