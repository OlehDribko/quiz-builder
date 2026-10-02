import type { Metadata } from "next";

import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata: Metadata = {
  title: "Create Quiz",
};

export default function CreateQuizPage() {
  return (
    <PagePlaceholder title="Create Quiz" description="The quiz creation form will appear here." />
  );
}
