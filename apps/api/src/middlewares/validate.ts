import { RequestHandler } from "express"
import { ZodType } from "zod"

type Schemas = {
  body?: ZodType,
  query?: ZodType,
  params?: ZodType
}

export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, res, next) => {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) res.locals.query = schemas.query.parse(req.query);
    if (schemas.params) res.locals.params = schemas.params.parse(req.params);
    next()
  };
