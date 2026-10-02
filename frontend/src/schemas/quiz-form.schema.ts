import type { FieldErrors } from "react-hook-form";
import { z } from "zod";

import type { QuestionType } from "@/types/quiz";

// Mirrors the backend validation rules for POST /quizzes.
const requiredText = (message: string) => z.string().trim().min(1, message);

const optionSchema = z.object({
  text: requiredText("Option text is required"),
  isCorrect: z.boolean(),
});

const booleanQuestionSchema = z.object({
  text: requiredText("Question text is required"),
  type: z.literal("BOOLEAN"),
  booleanAnswer: z.boolean({ error: "Select the correct answer" }),
});

const inputQuestionSchema = z.object({
  text: requiredText("Question text is required"),
  type: z.literal("INPUT"),
  textAnswer: requiredText("Correct answer is required"),
});

const checkboxQuestionSchema = z.object({
  text: requiredText("Question text is required"),
  type: z.literal("CHECKBOX"),
  options: z
    .array(optionSchema)
    .min(2, "Add at least 2 options")
    .refine((options) => options.some((option) => option.isCorrect), {
      message: "Mark at least one option as correct",
    }),
});

const questionSchema = z.discriminatedUnion("type", [
  booleanQuestionSchema,
  inputQuestionSchema,
  checkboxQuestionSchema,
]);

export const quizFormSchema = z.object({
  title: requiredText("Title is required"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
export type QuestionFormValues = QuizFormValues["questions"][number];

type QuestionFieldsOf<T extends QuestionFormValues["type"]> = Omit<
  Extract<QuestionFormValues, { type: T }>,
  "type"
>;

// React Hook Form cannot narrow errors of a union item, so expose every possible question field.
export type QuestionErrors = FieldErrors<
  QuestionFieldsOf<"BOOLEAN"> & QuestionFieldsOf<"INPUT"> & QuestionFieldsOf<"CHECKBOX">
>;

export function createEmptyQuestion(type: QuestionType, text = ""): QuestionFormValues {
  switch (type) {
    case "BOOLEAN":
      return { text, type, booleanAnswer: true };
    case "INPUT":
      return { text, type, textAnswer: "" };
    case "CHECKBOX":
      return {
        text,
        type,
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      };
  }
}
