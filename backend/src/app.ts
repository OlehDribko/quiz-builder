import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import quizzesRouter from "./routes/quizzes.routes.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/quizzes", quizzesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
