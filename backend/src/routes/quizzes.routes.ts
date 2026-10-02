import { Router } from "express";

import * as quizzesController from "../controllers/quizzes.controller.js";

const quizzesRouter = Router();

quizzesRouter.post("/", quizzesController.createQuiz);
quizzesRouter.get("/", quizzesController.listQuizzes);
quizzesRouter.get("/:id", quizzesController.getQuiz);
quizzesRouter.delete("/:id", quizzesController.deleteQuiz);

export default quizzesRouter;
