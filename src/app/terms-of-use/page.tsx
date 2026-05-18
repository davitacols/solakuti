import type { Metadata } from "next";
import PublisherPage from "@/components/PublisherPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Solakuti terms of use for readers, commenters, contributors, advertisers and platform users."
};

export default function TermsOfUsePage() {
  return (
    <PublisherPage
      eyebrow="Terms"
      title="Terms for using Solakuti."
      intro="These terms govern access to Solakuti, including articles, comments, newsletters, media uploads, advertising enquiries and other public-facing features."
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
          body: "Readers must not abuse the platform, attempt unauthorized access, submit malware, impersonate others, harass users, post unlawful content or interfere with newsroom systems."
        },
        {
          title: "Comments",
          body: "Comments should be lawful, relevant and respectful. Solakuti may remove comments that are defamatory, abusive, spammy, discriminatory, misleading, threatening, infringing or otherwise harmful."
        },
        {
          title: "Accounts",
          body: "Users are responsible for keeping account credentials secure. Admin, editor and contributor access may be suspended or removed if misuse, unauthorized sharing or suspicious activity is detected."
        },
        {
          title: "Intellectual Property",
          body: "Solakuti articles, graphics, logos, page designs and original media are protected by intellectual property laws. You may share article links, but copying or republishing substantial content requires permission unless permitted by law."
        },
        {
          title: "User Submissions",
          body: "By sending tips, comments, photos, videos or other material, you confirm you have the right to share it and grant Solakuti permission to review, edit, publish or use it for editorial purposes."
        },
        {
          title: "Advertising And Sponsored Content",
          body: "Paid placements, sponsorships and branded content are handled separately from editorial decisions and should be clearly labeled where published."
        },
        {
          title: "No Warranty",
          body: "Solakuti is provided on an as-available basis. We work to maintain accuracy and availability, but we do not guarantee uninterrupted access or that every item of content will remain available."
        },
        {
          title: "Contact",
          body: "Questions about these terms, corrections or permissions can be sent through the contact page or to editorial@solakuti.com."
        }
      ]}
    />
  );
}
