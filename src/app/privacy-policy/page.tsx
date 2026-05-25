import type { Metadata } from "next";
import PublisherPage from "@/components/PublisherPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Solakuti privacy policy covering reader data, analytics, advertising, comments, newsletters and data rights.",
  path: "/privacy-policy"
});

export default function PrivacyPolicyPage() {
  return (
    <PublisherPage
      eyebrow="Privacy"
      title="How Solakuti handles reader data."
      intro="This policy explains what Solakuti may collect, why we collect it, how we protect it and how readers can contact us about privacy requests."
      sections={[
        {
          title: "Information We Collect",
          body: "We may collect information readers provide directly, including account details, comments, contact messages, newsletter email addresses and editorial submissions. We also collect limited technical data such as page views, device type, browser information, IP address, timestamps and referral sources."
        },
        {
          title: "How We Use Information",
          body: "We use reader data to publish and improve the site, process comments, manage newsletter subscriptions, measure audience engagement, protect accounts, prevent abuse, troubleshoot technical issues and respond to contact or correction requests."
        },
        {
          title: "Analytics And Advertising",
          body: "Solakuti may use analytics and advertising services, including Google tools, to understand traffic, measure campaigns and show ads. These services may use cookies or similar technologies subject to their own privacy policies and user controls."
        },
        {
          title: "Newsletter",
          body: "Newsletter email addresses are used to send Solakuti updates and related editorial or commercial notices. Readers can unsubscribe or request deactivation of a newsletter email address."
        },
        {
          title: "Comments And Accounts",
          body: "When readers create accounts or post comments, we store the information needed to provide those features. Comments may be publicly visible, and abusive or unlawful comments may be removed under our Terms of Use."
        },
        {
          title: "Service Providers",
          body: "We may rely on hosting, database, analytics, advertising, media storage, email and security providers to operate Solakuti. These providers process limited data needed to deliver their services."
        },
        {
          title: "Security And Retention",
          body: "Admin activity, login attempts and upload actions may be logged to protect the newsroom. We keep information only as long as reasonably needed for operations, legal, security, editorial or record-keeping purposes."
        },
        {
          title: "Your Choices",
          body: "Readers may request access, correction, deletion or newsletter removal by contacting Solakuti with the relevant email address and request details. Some records may be retained where required for security, legal or editorial accountability."
        },
        {
          title: "Children",
          body: "Solakuti is a general news platform and is not directed to children. We do not knowingly collect personal information from children."
        },
        {
          title: "Contact",
          body: "Privacy requests can be sent through the contact page or to editorial@solakuti.com with a clear subject line and the relevant account or newsletter email."
        }
      ]}
    />
  );
}
