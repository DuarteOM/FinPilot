import { HttpError } from "../utils/http.js";

export function notFound(req, _res, next) {
  next(new HttpError(404, `Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const mysqlDuplicate = error.code === "ER_DUP_ENTRY";
  const status  = error.status ?? (mysqlDuplicate ? 409 : 500);
  const operational = error instanceof HttpError || mysqlDuplicate;

  // Always log 500s — never swallow them silently
  if (status >= 500) {
    console.error(`[${status}] ${error.message}`);
    console.error(error.stack ?? "(no stack)");
  }

  // In development always return the real error message so the browser shows it
  const isDev = (process.env.NODE_ENV ?? "development") !== "production";

  res.status(status).json({
    error: operational || status < 500 || isDev
      ? error.message
      : "Ocorreu um erro interno.",
    ...(error.details ? { details: error.details } : {}),
    ...(isDev && !operational && status >= 500
      ? { stack: error.stack?.split("\n").slice(0, 8) }
      : {}),
  });
}
