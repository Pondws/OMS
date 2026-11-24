import { Request, Response, NextFunction } from "express"
import { fromNodeHeaders } from "better-auth/node"
import { auth } from "../lib/auth"

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    // req.user = {
    //   id: session.user.id,
    //   email: session.user.email,
    //   role: (session.user as { role?: string }).role ?? "user",
    // }

    next()
  } catch (error) {
    next(error)
  }
}