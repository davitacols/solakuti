import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description: "Solakuti privacy policy covering reader data, analytics, advertising, cookies and data rights.",
  path: "/privacy-policy"
});

const linkClass = "font-bold underline underline-offset-2 hover:text-black";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="How Solakuti handles reader data."
      intro="This policy explains what Solakuti may collect, why we collect it, how we protect it and how readers can contact us about privacy requests."
      lastUpdated="May 2026"
      contactEmail="editorial@solakuti.com"
      contactNote="Privacy and data requests are handled by the editorial team."
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
          title: "Cookies",
          body: (
            <>
              Solakuti uses cookies — small text files stored on your device — to operate the site, remember preferences and serve relevant ads. Functional cookies are required for the site to work. Analytics cookies (Google Analytics, Google Tag Manager) help us understand how readers use the site. Advertising cookies (Google AdSense) serve personalised ads based on your interests.
              {" "}You can opt out of personalised advertising at{" "}
              <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                optout.aboutads.info
              </a>{" "}
              or via{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Google Ad Settings
              </a>
              . You can also disable cookies in your browser settings, though this may affect site functionality.
            </>
          )
        },
        {
          title: "Analytics And Advertising",
          body: (
            <>
              Solakuti uses Google Analytics, Google Tag Manager and Google AdSense to understand traffic, measure campaigns and show ads. Google and other third-party vendors may place and read cookies on readers&apos; browsers or use web beacons, IP addresses and similar identifiers to collect information as a result of ad serving and measurement. Readers can learn how Google uses data from partner sites at{" "}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className={linkClass}>
                policies.google.com/technologies/partner-sites
              </a>
              . Our publisher ID is ca-pub-5089730714682068.
            </>
          )
        },
        {
          title: "Newsletter",
          body: "Newsletter email addresses are used to send Solakuti updates and related editorial or commercial notices. Readers can unsubscribe or request deletion of a newsletter email address at any time."
        },
        {
          title: "Comments And Accounts",
          body: "When readers create accounts or post comments, we store the information needed to provide those features. Comments may be publicly visible. Abusive or unlawful comments may be removed under our Terms of Use."
        },
        {
          title: "Service Providers",
          body: "We may rely on hosting, database, analytics, advertising, media storage, email and security providers to operate Solakuti. These providers process limited data needed to deliver their services and are bound by appropriate data handling terms."
        },
        {
          title: "Security And Retention",
          body: "Admin activity, login attempts and upload actions may be logged to protect the newsroom. We keep information only as long as reasonably needed for operations, legal, security, editorial or record-keeping purposes."
        },
        {
          title: "Your Rights",
          body: "Readers may request access, correction, deletion or newsletter removal by contacting Solakuti with the relevant email address and request details. Some records may be retained where required for security, legal or editorial accountability."
        },
        {
          title: "Children",
          body: "Solakuti is a general news platform not directed to children under 13. We do not knowingly collect personal information from children. If we learn that we have collected such information, we will delete it."
        },
        {
          title: "Changes To This Policy",
          body: "We may update this policy from time to time. The date at the top of this page reflects when it was last revised. Continued use of Solakuti after changes constitutes acceptance of the updated policy."
        }
      ]}
    />
  );
}
