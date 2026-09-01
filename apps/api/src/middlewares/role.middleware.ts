import {
  NextFunction,
  Response,
  Request
} from "express"
import { Role } from "../modules/auth/auth.types"

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      })
    }

    if (!roles.includes(req.user.role as Role)) {
      return res.status(403).json({
        message: "Forbidden"
      })
    }

    next()
  }
}