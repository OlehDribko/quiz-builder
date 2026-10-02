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

export function getApiErrorDetails(error: unknown): string[] {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return [];
  }

  return (error.response?.data?.details ?? []).map(({ path, message }) =>
    path ? `${path}: ${message}` : message,
  );
}

export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
