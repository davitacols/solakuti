import type { Metadata } from "next";
import PublisherPage from "@/components/PublisherPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Solakuti privacy policy for readers, commenters, newsletter subscribers and newsroom users."
};

export default function PrivacyPolicyPage() {
  return (
    <PublisherPage
      eyebrow="Privacy"
      title="Reader privacy and data handling."
      intro="Solakuti collects only the data needed to operate the newsroom, protect the platform, improve reader experience and manage subscriptions."
      sections={[
        {
          title: "Reader Data",
          body: "We may collect basic analytics such as page views, device information and browser user agent to understand readership and protect the site."
        },
        {
          title: "Accounts And Comments",
          body: "When readers create accounts or comment, we store the account details and comment content needed to provide those features."
        },
        {
          title: "Newsletter",
          body: "Newsletter email addresses are used for Solakuti updates and can be unsubscribed or deactivated."
        },
        {
          title: "Security",
          body: "Admin activity, login attempts and upload actions may be logged to protect the newsroom from unauthorized access or abuse."
        },
        {
          title: "Third Parties",
          body: "Media hosting, analytics and deployment providers may process limited technical data required to deliver the service."
        },
        {
          title: "Contact",
          body: "Privacy requests can be sent through the contact page with a clear subject line and the relevant account email."
        }
      ]}
    />
  );
}
