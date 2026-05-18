"use client";

import { useEffect } from "react";
import ErrorState from "@/components/ErrorState";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Solakuti route error", error);
  }, [error]);

  return (
    <ErrorState
      eyebrow="Something went wrong"
      title="The newsroom hit a temporary fault."
      message="Please retry the page. If this continues, the editorial team can review the issue from the server logs."
      reset={reset}
    />
  );
}
