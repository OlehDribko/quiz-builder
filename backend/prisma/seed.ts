import "dotenv/config";

import { QuestionType } from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";

const SAMPLE_QUIZ_TITLE = "JavaScript Basics";

async function main(): Promise<void> {
  const existing = await prisma.quiz.findFirst({ where: { title: SAMPLE_QUIZ_TITLE } });

  if (existing) {
    console.log(`Sample quiz already exists (id: ${existing.id}), skipping seed`);
    return;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: SAMPLE_QUIZ_TITLE,
      questions: {
        create: [
          {
            text: "JavaScript is dynamically typed",
            type: QuestionType.BOOLEAN,
            booleanAnswer: true,
          },
          {
            text: "What does DOM stand for?",
            type: QuestionType.INPUT,
            textAnswer: "Document Object Model",
          },
          {
            text: "Select JavaScript frameworks",
            type: QuestionType.CHECKBOX,
            options: {
              create: [
                { text: "React", isCorrect: true },
                { text: "Vue", isCorrect: true },
                { text: "Django", isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`Seeded quiz "${quiz.title}" (id: ${quiz.id})`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
