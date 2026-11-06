import { ErrorRequestHandler } from "express"
import multer from "multer"
import { ZodError } from "zod"
import { AppError } from "../errors/app-error"

const multerMessages: Record<string, string> = {
  LIMIT_FILE_SIZE: "ไฟล์ใหญ่เกิน 5 MB",
  LIMIT_FILE_COUNT: "อัปโหลดได้สูงสุด 10 ไฟล์",
  LIMIT_UNEXPECTED_FILE: 'ชื่อ field ไม่ถูกต้องหรือไฟล์เกินจำนวน (ใช้ "images")',
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown, // ← เปลี่ยนจาก any เป็น unknown
  _req,
  res,
  next,
) => {
  if (res.headersSent) return next(err)

  // 1) ข้อมูลไม่ผ่าน Zod → 400
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "ข้อมูลไม่ถูกต้อง",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    })
    return
  }

  // 2) error จาก multer → 400
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      success: false,
      message: multerMessages[err.code] ?? err.message,
    })
    return
  }

  // 3) error ที่เราโยนเอง → ใช้ statusCode ที่กำหนด
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message })
    return
  }

  // 4) error อื่นที่ไม่คาดคิด (Supabase, DB, bug) → 500
  console.error(err)
  res.status(500).json({ success: false, message: "Internal Server Error" })
}