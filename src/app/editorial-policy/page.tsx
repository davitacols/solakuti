import type { Metadata } from "next";
import PublisherPage from "@/components/PublisherPage";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "Solakuti editorial standards, corrections policy, sourcing and publishing principles."
};

export default function EditorialPolicyPage() {
  return (
    <PublisherPage
      eyebrow="Editorial policy"
      title="Standards for accurate, useful and accountable journalism."
      intro="Solakuti publishes news and analysis with a commitment to public value, clear sourcing, fairness and correction when errors occur."
      sections={[
        {
          title: "Accuracy",
          body: "We verify key facts before publication and update developing stories when new information is confirmed."
        },
        {
          title: "Attribution",
          body: "We attribute claims, documents and public statements wherever possible. Anonymous sourcing is used only when there is a clear public-interest reason."
        },
        {
          title: "Corrections",
          body: "Material errors are corrected promptly. Readers can request corrections through the contact page with article URLs and supporting evidence."
        },
        {
          title: "Opinion",
          body: "Opinion articles are labeled and separated from straight news reporting. Opinion writers are responsible for arguments, while editors check for clarity and fairness."
        },
        {
          title: "Sponsored Content",
          body: "Sponsored or paid content is clearly labeled. Commercial relationships do not determine newsroom coverage."
        },
        {
          title: "AI And Automation",
          body: "Editorial tools may assist workflow, but final publishing responsibility rests with human editors."
        }
      ]}
    />
  );
}
