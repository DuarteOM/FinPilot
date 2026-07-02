import { HttpError } from "../utils/http.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return next(new HttpError(422, "Dados inválidos.", result.error.flatten()));
  req[source] = result.data;
  next();
};
