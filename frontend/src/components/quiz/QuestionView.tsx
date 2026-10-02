import type { Question, QuestionType } from "@/types/quiz";

const TYPE_LABELS: Record<QuestionType, string> = {
  BOOLEAN: "True / False",
  INPUT: "Text input",
  CHECKBOX: "Multiple choice",
};

const answerLabelClassName = "text-xs font-medium tracking-wide text-zinc-500 uppercase";

function BooleanAnswer({ value }: { value: boolean | null }) {
  return (
    <div className="space-y-1">
      <p className={answerLabelClassName}>Correct answer</p>
      <p className="text-sm font-semibold text-zinc-900">{value ? "True" : "False"}</p>
    </div>
  );
}

function InputAnswer({ value }: { value: string | null }) {
  return (
    <div className="space-y-1">
      <p className={answerLabelClassName}>Expected answer</p>
      <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm break-words text-zinc-900">
        {value}
      </p>
    </div>
  );
}

function CheckboxAnswer({ options }: { options: Question["options"] }) {
  return (
    <div className="space-y-2">
      <p className={answerLabelClassName}>Options</p>
      <ul className="space-y-2">
        {options.map((option) => (
          <li
            key={option.id}
            className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm ${
              option.isCorrect
                ? "border-emerald-300 bg-emerald-50 font-medium text-zinc-900"
                : "border-zinc-200 text-zinc-600"
            }`}
          >
            <span className="flex min-w-0 items-start gap-2">
              <span aria-hidden="true" className="w-4 shrink-0 text-center">
                {option.isCorrect ? "✓" : "–"}
              </span>
              <span className="break-words">{option.text}</span>
            </span>
            {option.isCorrect ? (
              <span className="shrink-0 rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-medium text-white">
                Correct
              </span>
            ) : (
              <span className="sr-only">Incorrect</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface QuestionViewProps {
  question: Question;
  number: number;
}

export default function QuestionView({ question, number }: QuestionViewProps) {
  const headingId = `question-${question.id}-heading`;

  return (
    <li>
      <article
        aria-labelledby={headingId}
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-500">Question {number}</p>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
              {TYPE_LABELS[question.type]}
            </span>
          </div>
          <h2 id={headingId} className="text-base font-semibold break-words text-zinc-900">
            {question.text}
          </h2>
        </header>

        {question.type === "BOOLEAN" && <BooleanAnswer value={question.booleanAnswer} />}
        {question.type === "INPUT" && <InputAnswer value={question.textAnswer} />}
        {question.type === "CHECKBOX" && <CheckboxAnswer options={question.options} />}
      </article>
    </li>
  );
}
