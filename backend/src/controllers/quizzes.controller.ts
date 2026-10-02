import type { Request, Response } from "express";

import { HttpError } from "../lib/http-error.js";
import { createQuizSchema, quizIdParamSchema } from "../schemas/quiz.schema.js";
import * as quizzesService from "../services/quizzes.service.js";

function parseQuizId(params: Request["params"]): number {
  const result = quizIdParamSchema.safeParse(params);

  if (!result.success) {
    throw new HttpError(400, "Quiz id must be a positive integer");
  }

  return result.data.id;
}

export async function createQuiz(req: Request, res: Response): Promise<void> {
  const input = createQuizSchema.parse(req.body);
  const quiz = await quizzesService.createQuiz(input);
  res.status(201).json(quiz);
}

export async function listQuizzes(_req: Request, res: Response): Promise<void> {
  const quizzes = await quizzesService.listQuizzes();
  res.json(quizzes);
}

export async function getQuiz(req: Request, res: Response): Promise<void> {
  const quiz = await quizzesService.getQuizById(parseQuizId(req.params));
  res.json(quiz);
}

export async function deleteQuiz(req: Request, res: Response): Promise<void> {
  await quizzesService.deleteQuiz(parseQuizId(req.params));
  res.status(204).end();
}
