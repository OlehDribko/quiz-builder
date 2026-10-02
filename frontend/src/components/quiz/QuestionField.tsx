"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";

import {
  createEmptyQuestion,
  type QuestionErrors,
  type QuestionFormValues,
  type QuizFormValues,
} from "@/schemas/quiz-form.schema";
import type { QuestionType } from "@/types/quiz";

import CheckboxOptionsField from "./CheckboxOptionsField";
import { errorClassName, inputClassName, labelClassName, removeButtonClassName } from "./styles";

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  BOOLEAN: "Boolean",
  INPUT: "Input",
  CHECKBOX: "Checkbox",
};

interface QuestionFieldProps {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onReplace: (question: QuestionFormValues) => void;
}

export default function QuestionField({
  index,
  canRemove,
  onRemove,
  onReplace,
}: QuestionFieldProps) {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<QuizFormValues>();
  const type = useWatch({ control, name: `questions.${index}.type` });

  const questionErrors = errors.questions?.[index] as QuestionErrors | undefined;
  const textError = questionErrors?.text?.message;
  const textAnswerError = questionErrors?.textAnswer?.message;
  const booleanAnswerError = questionErrors?.booleanAnswer?.message;

  const idPrefix = `question-${index}`;

  // Replacing the whole question drops answer fields that belong to the previous type.
  const handleTypeChange = (nextType: QuestionType) => {
    onReplace(createEmptyQuestion(nextType, getValues(`questions.${index}.text`)));
  };

  return (
    <li className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-zinc-900">Question {index + 1}</h2>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Remove question ${index + 1}`}
          className={removeButtonClassName}
        >
          Remove
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}-text`} className={labelClassName}>
            Question text
          </label>
          <input
            id={`${idPrefix}-text`}
            type="text"
            placeholder="e.g. JavaScript is dynamically typed"
            aria-invalid={textError ? true : undefined}
            aria-describedby={textError ? `${idPrefix}-text-error` : undefined}
            className={inputClassName}
            {...register(`questions.${index}.text`)}
          />
          {textError && (
            <p id={`${idPrefix}-text-error`} className={errorClassName}>
              {textError}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor={`${idPrefix}-type`} className={labelClassName}>
            Type
          </label>
          <select
            id={`${idPrefix}-type`}
            value={type}
            onChange={(event) => handleTypeChange(event.target.value as QuestionType)}
            className={inputClassName}
          >
            {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {type === "BOOLEAN" && (
        <Controller
          control={control}
          name={`questions.${index}.booleanAnswer`}
          render={({ field }) => (
            <fieldset className="space-y-2">
              <legend className={labelClassName}>Correct answer</legend>
              <div className="flex gap-6">
                {[true, false].map((value) => (
                  <label
                    key={String(value)}
                    className="flex items-center gap-2 text-sm text-zinc-900"
                  >
                    <input
                      type="radio"
                      name={field.name}
                      checked={field.value === value}
                      onChange={() => field.onChange(value)}
                      onBlur={field.onBlur}
                      className="size-4 accent-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
                    />
                    {value ? "True" : "False"}
                  </label>
                ))}
              </div>
              {booleanAnswerError && <p className={errorClassName}>{booleanAnswerError}</p>}
            </fieldset>
          )}
        />
      )}

      {type === "INPUT" && (
        <div className="space-y-1">
          <label htmlFor={`${idPrefix}-answer`} className={labelClassName}>
            Correct answer
          </label>
          <input
            id={`${idPrefix}-answer`}
            type="text"
            placeholder="e.g. Document Object Model"
            aria-invalid={textAnswerError ? true : undefined}
            aria-describedby={textAnswerError ? `${idPrefix}-answer-error` : undefined}
            className={inputClassName}
            {...register(`questions.${index}.textAnswer`)}
          />
          {textAnswerError && (
            <p id={`${idPrefix}-answer-error`} className={errorClassName}>
              {textAnswerError}
            </p>
          )}
        </div>
      )}

      {type === "CHECKBOX" && <CheckboxOptionsField questionIndex={index} />}
    </li>
  );
}
