"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import type { QuestionErrors, QuizFormValues } from "@/schemas/quiz-form.schema";

import {
  errorClassName,
  inputClassName,
  removeButtonClassName,
  secondaryButtonClassName,
} from "./styles";

const MIN_OPTIONS = 2;

interface CheckboxOptionsFieldProps {
  questionIndex: number;
}

export default function CheckboxOptionsField({ questionIndex }: CheckboxOptionsFieldProps) {
  const {
    control,
    register,
    trigger,
    formState: { errors, isSubmitted },
  } = useFormContext<QuizFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const optionsError = (errors.questions?.[questionIndex] as QuestionErrors | undefined)?.options;
  const optionsMessage = optionsError?.root?.message ?? optionsError?.message;
  const optionsErrorId = `question-${questionIndex}-options-error`;

  // Field-level revalidation does not refresh the array-level "at least one correct" error.
  const revalidateOptions = () => {
    if (isSubmitted) {
      void trigger(`questions.${questionIndex}.options`);
    }
  };

  return (
    <fieldset className="space-y-3" aria-describedby={optionsMessage ? optionsErrorId : undefined}>
      <legend className="text-sm font-medium text-zinc-900">
        Options <span className="font-normal text-zinc-500">(check every correct answer)</span>
      </legend>

      <ul className="space-y-3">
        {fields.map((field, optionIndex) => {
          const inputId = `question-${questionIndex}-option-${optionIndex}`;
          const textError = optionsError?.[optionIndex]?.text?.message;

          return (
            <li key={field.id} className="space-y-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="checkbox"
                  id={`${inputId}-correct`}
                  aria-label={`Option ${optionIndex + 1} is correct`}
                  className="size-5 shrink-0 accent-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                  {...register(`questions.${questionIndex}.options.${optionIndex}.isCorrect`, {
                    onChange: revalidateOptions,
                  })}
                />
                <label htmlFor={inputId} className="sr-only">
                  Option {optionIndex + 1} text
                </label>
                <input
                  id={inputId}
                  type="text"
                  placeholder={`Option ${optionIndex + 1}`}
                  aria-invalid={textError ? true : undefined}
                  aria-describedby={textError ? `${inputId}-error` : undefined}
                  className={inputClassName}
                  {...register(`questions.${questionIndex}.options.${optionIndex}.text`)}
                />
                <button
                  type="button"
                  onClick={() => remove(optionIndex)}
                  disabled={fields.length <= MIN_OPTIONS}
                  aria-label={`Remove option ${optionIndex + 1}`}
                  className={`${removeButtonClassName} shrink-0`}
                >
                  Remove
                </button>
              </div>
              {textError && (
                <p id={`${inputId}-error`} className={`${errorClassName} pl-7 sm:pl-8`}>
                  {textError}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {optionsMessage && (
        <p id={optionsErrorId} role="alert" className={errorClassName}>
          {optionsMessage}
        </p>
      )}

      <button
        type="button"
        onClick={() => append({ text: "", isCorrect: false })}
        className={secondaryButtonClassName}
      >
        + Add option
      </button>
    </fieldset>
  );
}
