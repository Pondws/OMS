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
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params
      }

      if (schemas.query) {
        Object.defineProperty(req, "query", {
          value: schemas.query.parse(req.query),
          writable: true,
          enumerable: true,
          configurable: true,
        })
      }

      if (schemas.body) {
        req.body = schemas.body.parse(req.body)
      }

      next()
    }