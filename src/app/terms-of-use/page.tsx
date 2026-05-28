import type { Metadata } from "next";
import PolicyPage from "@/components/PolicyPage";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Use",
  description: "Solakuti terms of use for readers, commenters, contributors, advertisers and platform users.",
  path: "/terms-of-use"
});

export default function TermsOfUsePage() {
  return (
    <PolicyPage
      eyebrow="Terms"
      title="Terms for using Solakuti."
      intro="These terms govern access to Solakuti, including articles, comments, newsletters, media uploads, advertising enquiries and other public-facing features."
      lastUpdated="May 2026"
      contactEmail="editorial@solakuti.com"
      contactNote="Questions about these terms can be sent to the editorial team."
      sections={[
        {
          title: "Acceptance",
          body: "By accessing Solakuti, you agree to use the platform responsibly and in line with these terms, our Privacy Policy and applicable laws. If you do not agree, you should stop using the site."
        },
        {
          title: "Editorial Content",
          body: "Solakuti publishes news, analysis, opinion and media for public information. Content may change as stories develop. We may update, correct, remove or archive material when editorially necessary."
        },
        {
          title: "Reader Conduct",
          body: "Readers must not abuse the platform, attempt unauthorised access, submit malware, impersonate others, harass users, post unlawful content or interfere with newsroom systems. Violations may result in account suspension or removal."
        },
        {
          title: "Comments",
          body: "Comments should be lawful, relevant and respectful. Solakuti may remove comments that are defamatory, abusive, spammy, discriminatory, misleading, threatening, infringing or otherwise harmful. Persistent abuse may result in account suspension."
        },
        {
          title: "Accounts",
          body: "Users are responsible for keeping account credentials secure. Admin, editor and contributor access may be suspended or removed if misuse, unauthorised sharing or suspicious activity is detected."
        },
        {
          title: "Intellectual Property",
          body: "Solakuti articles, graphics, logos, page designs and original media are protected by intellectual property laws. You may share article links, but copying or republishing substantial content requires written permission unless expressly permitted by law."
        },
        {
          title: "User Submissions",
          body: "By sending tips, comments, photos, videos or other material, you confirm you have the right to share it and grant Solakuti permission to review, edit, publish or use it for editorial purposes without further compensation."
        },
        {
          title: "Advertising And Sponsored Content",
          body: "Paid placements, sponsorships and branded content are handled separately from editorial decisions and are clearly disclosed where published. Readers who interact with ads do so at their own discretion."
        },
        {
          title: "Third-Party Links",
          body: "Solakuti may link to external sites for reader reference. We are not responsible for the content, privacy practices or accuracy of third-party websites. Links do not constitute editorial endorsement."
        },
        {
          title: "Limitation Of Liability",
          body: "Solakuti is provided on an as-available basis. We work to maintain accuracy and availability but do not guarantee uninterrupted access or that every item of content will remain available. We are not liable for decisions made on the basis of content published on this site."
        },
        {
          title: "Governing Law",
          body: "These terms are governed by the laws of the Federal Republic of Nigeria. Disputes arising from use of Solakuti will be subject to Nigerian jurisdiction."
        },
        {
          title: "Changes To These Terms",
          body: "We may update these terms from time to time. The date at the top reflects when they were last revised. Continued use of Solakuti after changes constitutes acceptance of the updated terms."
        }
      ]}
    />
  );
}
