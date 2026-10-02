import { z } from "zod";

// Matches the PostgreSQL INTEGER range used by autoincrement ids.
const MAX_INT_ID = 2_147_483_647;

// Distinguishes a missing field from a value of the wrong type.
const typeError =
  (field: string, expected: string) =>
  (issue: { input: unknown }): string =>
    issue.input === undefined ? `${field} is required` : `${field} must be ${expected}`;

const nonEmptyString = (field: string) =>
  z
    .string({ error: typeError(field, "a string") })
    .trim()
    .min(1, `${field} must not be empty`);

const questionText = nonEmptyString("Question text");

const booleanQuestionSchema = z.object({
  text: questionText,
  type: z.literal("BOOLEAN"),
  booleanAnswer: z.boolean({ error: typeError("booleanAnswer", "a boolean") }),
});

const inputQuestionSchema = z.object({
  text: questionText,
  type: z.literal("INPUT"),
  textAnswer: nonEmptyString("textAnswer"),
});

const optionSchema = z.object({
  text: nonEmptyString("Option text"),
  isCorrect: z.boolean({ error: typeError("isCorrect", "a boolean") }),
});

const checkboxQuestionSchema = z.object({
  text: questionText,
  type: z.literal("CHECKBOX"),
  options: z
    .array(optionSchema, { error: typeError("options", "an array") })
    .min(2, "Checkbox question must have at least 2 options")
    .refine((options) => options.some((option) => option.isCorrect), {
      message: "At least one option must be correct",
    }),
});

const questionSchema = z.discriminatedUnion(
  "type",
  [booleanQuestionSchema, inputQuestionSchema, checkboxQuestionSchema],
  { error: "type must be one of BOOLEAN, INPUT, CHECKBOX" },
);

export const createQuizSchema = z.object(
  {
    title: nonEmptyString("Title"),
    questions: z
      .array(questionSchema, { error: typeError("questions", "an array") })
      .min(1, "Quiz must contain at least one question"),
  },
  { error: "Request body must be a JSON object" },
);

export const quizIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(MAX_INT_ID)),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type CreateQuestionInput = CreateQuizInput["questions"][number];
