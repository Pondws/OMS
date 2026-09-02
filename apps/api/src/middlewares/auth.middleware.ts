import {
  Request,
  Response,
  NextFunction
} from "express"

import JWTGenerate from "../lib/jwt"
import { AuthUser } from "../modules/auth/auth.types"

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.accessToken

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized"
      })
    }

    const payload = JWTGenerate.verifyAccessToken(token)

    req.user = payload as AuthUser

    next()
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    })
  }
}


export default authMiddleware