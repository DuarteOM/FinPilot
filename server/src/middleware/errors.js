import { HttpError } from "../utils/http.js";

export function notFound(req, _res, next) {
  next(new HttpError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || (error.code === "SQLITE_CONSTRAINT_UNIQUE" ? 409 : 500);
  const operational = error instanceof HttpError;
  if (!operational && status >= 500) console.error(error);
  res.status(status).json({
    error: operational || status < 500 ? error.message : "Ocorreu um erro interno.",
    ...(error.details ? { details: error.details } : {}),
  });
}
