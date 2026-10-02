import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { HttpError } from "../lib/http-error.js";

interface ExposedHttpError extends Error {
  status: number;
  expose: true;
  type?: unknown;
}

// Errors raised by Express internals (e.g. malformed JSON body) that are safe to show to clients.
function isExposedHttpError(err: unknown): err is ExposedHttpError {
  return (
    err instanceof Error &&
    "status" in err &&
    typeof err.status === "number" &&
    "expose" in err &&
    err.expose === true
  );
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (isExposedHttpError(err)) {
    // express.json() marks JSON syntax errors with this type; hide the raw parser message.
    const message = err.type === "entity.parse.failed" ? "Malformed JSON body" : err.message;
    res.status(err.status).json({ error: message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
