export type QuestionType = "BOOLEAN" | "INPUT" | "CHECKBOX";

export interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  booleanAnswer: boolean | null;
  textAnswer: string | null;
  options: QuestionOption[];
}

export interface Quiz {
  id: number;
  title: string;
  createdAt: string;
  questions: Question[];
}

export interface QuizListItem {
  id: number;
  title: string;
  questionCount: number;
}

export interface CreateBooleanQuestion {
  text: string;
  type: "BOOLEAN";
  booleanAnswer: boolean;
}

export interface CreateInputQuestion {
  text: string;
  type: "INPUT";
  textAnswer: string;
}

export interface CreateCheckboxQuestion {
  text: string;
  type: "CHECKBOX";
  options: Array<Pick<QuestionOption, "text" | "isCorrect">>;
}

export type CreateQuestionPayload =
  CreateBooleanQuestion | CreateInputQuestion | CreateCheckboxQuestion;

export interface CreateQuizPayload {
  title: string;
  questions: CreateQuestionPayload[];
}

export interface ApiErrorResponse {
  error: string;
  details?: Array<{ path: string; message: string }>;
}
