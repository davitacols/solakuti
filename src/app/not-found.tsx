import type { Metadata } from "next";
import ErrorState from "@/components/ErrorState";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <ErrorState
      eyebrow="404"
      title="This page is not in the archive."
      message="The story may have moved, the address may be incorrect, or the article may not be public yet."
    />
  );
}
