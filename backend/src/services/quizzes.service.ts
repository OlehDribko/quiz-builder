import type { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/http-error.js";
import { prisma } from "../lib/prisma.js";
import type { CreateQuestionInput, CreateQuizInput } from "../schemas/quiz.schema.js";

const quizDetailsSelect = {
  id: true,
  title: true,
  createdAt: true,
  questions: {
    orderBy: { id: "asc" },
    select: {
      id: true,
      text: true,
      type: true,
      booleanAnswer: true,
      textAnswer: true,
      options: {
        orderBy: { id: "asc" },
        select: { id: true, text: true, isCorrect: true },
      },
    },
  },
} satisfies Prisma.QuizSelect;

export type QuizDetails = Prisma.QuizGetPayload<{ select: typeof quizDetailsSelect }>;

export interface QuizListItem {
  id: number;
  title: string;
  questionCount: number;
}

function toQuestionCreateData(
  question: CreateQuestionInput,
): Prisma.QuestionCreateWithoutQuizInput {
  switch (question.type) {
    case "BOOLEAN":
      return { text: question.text, type: question.type, booleanAnswer: question.booleanAnswer };
    case "INPUT":
      return { text: question.text, type: question.type, textAnswer: question.textAnswer };
    case "CHECKBOX":
      return {
        text: question.text,
        type: question.type,
        options: { create: question.options },
      };
  }
}

export async function createQuiz(input: CreateQuizInput): Promise<QuizDetails> {
  return prisma.quiz.create({
    data: {
      title: input.title,
      questions: { create: input.questions.map(toQuestionCreateData) },
    },
    select: quizDetailsSelect,
  });
}

export async function listQuizzes(): Promise<QuizListItem[]> {
  const quizzes = await prisma.quiz.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { id: true, title: true, _count: { select: { questions: true } } },
  });

  return quizzes.map(({ id, title, _count }) => ({ id, title, questionCount: _count.questions }));
}

export async function getQuizById(id: number): Promise<QuizDetails> {
  const quiz = await prisma.quiz.findUnique({ where: { id }, select: quizDetailsSelect });

  if (!quiz) {
    throw new HttpError(404, "Quiz not found");
  }

  return quiz;
}

export async function deleteQuiz(id: number): Promise<void> {
  // deleteMany avoids Prisma's "record not found" error; questions and options cascade in the database.
  const { count } = await prisma.quiz.deleteMany({ where: { id } });

  if (count === 0) {
    throw new HttpError(404, "Quiz not found");
  }
}
