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
    const authorization = req.headers.authorization

    if (!authorization) {
      return res.status(401).json({
        message: "Unauthorized"
      })
    }

    const [type, token] = authorization.split(" ")

    if (type !== "Bearer" || !type) {
      return res.status(401).json({
        message: "Invalid authorization",
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