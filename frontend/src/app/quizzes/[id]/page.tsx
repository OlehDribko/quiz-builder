import type { Metadata } from "next";

import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata: Metadata = {
  title: "Quiz Details",
};

export default async function QuizDetailsPage({ params }: PageProps<"/quizzes/[id]">) {
  const { id } = await params;

  return <PagePlaceholder title={`Quiz #${id}`} description="Quiz details will appear here." />;
}
