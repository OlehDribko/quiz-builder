"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { getApiErrorDetails, getApiErrorMessage } from "@/lib/api-error";
import {
  createEmptyQuestion,
  quizFormSchema,
  type QuestionFormValues,
  type QuizFormValues,
} from "@/schemas/quiz-form.schema";
import * as quizzesService from "@/services/quizzes.service";
import { useAppDispatch } from "@/store/hooks";
import { quizAdded } from "@/store/quizzesSlice";
import type { CreateQuestionPayload, CreateQuizPayload } from "@/types/quiz";

import QuestionField from "./QuestionField";
import { errorClassName, inputClassName, labelClassName, secondaryButtonClassName } from "./styles";

const defaultValues: QuizFormValues = {
  title: "",
  questions: [createEmptyQuestion("BOOLEAN")],
};

// Builds the payload explicitly so only fields relevant to each question type are sent.
function toQuestionPayload(question: QuestionFormValues): CreateQuestionPayload {
  switch (question.type) {
    case "BOOLEAN":
      return { text: question.text, type: question.type, booleanAnswer: question.booleanAnswer };
    case "INPUT":
      return { text: question.text, type: question.type, textAnswer: question.textAnswer };
    case "CHECKBOX":
      return {
        text: question.text,
        type: question.type,
        options: question.options.map(({ text, isCorrect }) => ({ text, isCorrect })),
      };
  }
}

export default function QuizForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // Backend validation details stay inline so they remain visible while the user fixes the form.
  const [serverErrorDetails, setServerErrorDetails] = useState<string[]>([]);
  const submitLockRef = useRef(false);

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues,
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;
  const { fields, append, remove, update } = useFieldArray({ control, name: "questions" });

  const titleError = errors.title?.message;
  const questionsError = errors.questions?.root?.message ?? errors.questions?.message;
  // Stay disabled after success until navigation completes.
  const isBusy = isSubmitting || isSubmitSuccessful;

  const onSubmit = async (values: QuizFormValues) => {
    setServerErrorDetails([]);
    const payload: CreateQuizPayload = {
      title: values.title,
      questions: values.questions.map(toQuestionPayload),
    };

    try {
      const quiz = await quizzesService.createQuiz(payload);
      dispatch(quizAdded({ id: quiz.id, title: quiz.title, questionCount: quiz.questions.length }));
      toast.success("Quiz created successfully");
      router.push("/quizzes");
    } catch (error) {
      toast.error(`Could not create the quiz: ${getApiErrorMessage(error, "Please try again.")}`);
      setServerErrorDetails(getApiErrorDetails(error));
      // Rethrow so React Hook Form does not mark the submission as successful.
      throw error;
    }
  };

  const releaseSubmitLock = () => {
    submitLockRef.current = false;
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The disabled button only applies after a re-render, so block rapid repeat submits here.
    // The lock stays set after success until navigation completes.
    if (submitLockRef.current) {
      return;
    }
    submitLockRef.current = true;
    handleSubmit(
      onSubmit,
      releaseSubmitLock,
    )(event).catch(() => {
      // The error is already shown via toast and serverErrorDetails.
      submitLockRef.current = false;
    });
  };

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-1 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <label htmlFor="quiz-title" className={labelClassName}>
            Quiz title
          </label>
          <input
            id="quiz-title"
            type="text"
            placeholder="e.g. JavaScript Basics"
            aria-invalid={titleError ? true : undefined}
            aria-describedby={titleError ? "quiz-title-error" : undefined}
            className={inputClassName}
            {...register("title")}
          />
          {titleError && (
            <p id="quiz-title-error" className={errorClassName}>
              {titleError}
            </p>
          )}
        </div>

        <ol className="space-y-4">
          {fields.map((field, index) => (
            <QuestionField
              key={field.id}
              index={index}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
              onReplace={(question) => update(index, question)}
            />
          ))}
        </ol>

        {questionsError && (
          <p role="alert" className={errorClassName}>
            {questionsError}
          </p>
        )}

        <button
          type="button"
          onClick={() => append(createEmptyQuestion("BOOLEAN"))}
          className={`${secondaryButtonClassName} w-full sm:w-auto`}
        >
          + Add question
        </button>

        {serverErrorDetails.length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <p className="font-medium">The server rejected the quiz. Please fix the following:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {serverErrorDetails.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-end">
          <Link href="/quizzes" className={secondaryButtonClassName}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isBusy}
            aria-busy={isSubmitting}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Creating…" : "Create quiz"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
