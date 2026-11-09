import { ErrorRequestHandler } from "express"
import { ZodError } from "zod"
import { AppError } from "../errors/app-error"

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "ข้อมูลไม่ถูกต้อง",
      errors: err.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  console.error(err)
  return res.status(500).json({ message: "เกิดข้อผิดพลาด" })
}