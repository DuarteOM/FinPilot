import { HttpError } from "../utils/http.js";

export function notFound(req, _res, next) {
  next(new HttpError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  // MySQL duplicate entry → 409
  const mysqlDuplicate = error.code === "ER_DUP_ENTRY";
  const status = error.status ?? (mysqlDuplicate ? 409 : 500);
  const operational = error instanceof HttpError || mysqlDuplicate;

  if (!operational && status >= 500) console.error(error);

  res.status(status).json({
    error: operational || status < 500 ? error.message : "Ocorreu um erro interno.",
    ...(error.details ? { details: error.details } : {}),
  });
}
