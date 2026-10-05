import {
  RequestHandler,
  ParamsDictionary,
} from "express-serve-static-core"

export const asyncHandler = <
  P extends ParamsDictionary = ParamsDictionary,
>(
  fn: RequestHandler<P>,
): RequestHandler<P> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}