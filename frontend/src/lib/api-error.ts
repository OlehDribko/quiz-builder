import axios from "axios";

import type { ApiErrorResponse } from "@/types/quiz";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  if (!error.response) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  return error.response.data?.error ?? fallback;
}
