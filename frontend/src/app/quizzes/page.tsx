import type { Metadata } from "next";

import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata: Metadata = {
  title: "Quizzes",
};

export default function QuizzesPage() {
  return <PagePlaceholder title="Quizzes" description="The list of quizzes will appear here." />;
}
