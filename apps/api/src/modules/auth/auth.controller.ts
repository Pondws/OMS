import {
  Request,
  Response
} from "express"
import authService from "./auth.service"

const ACCESS_TOKEN_MAX_AGE =
  15 * 60 * 1000

const REFRESH_TOKEN_MAX_AGE =
  7 * 24 * 60 * 60 * 1000

const cookieOptions = {
  httpOnly: true,
  // secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
}

const AuthController = {
  register: async (req: Request, res: Response) => {
    try {
      await authService.register(req.body)
      res.status(200).json({ message: "สมัครสมาชิกเรียบร้อย" })
    } catch (error) {
      res.status(400).json({
        message: 'เกิดข้อผิดพลาด'
      })
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const result = await authService.login(req.body)

      res.cookie(
        "accessToken",
        result.accessToken,
        {
          ...cookieOptions,
          maxAge: ACCESS_TOKEN_MAX_AGE
        }
      )

      res.cookie(
        "refreshToken",
        result.refreshToken,
        {
          ...cookieOptions,
          maxAge: REFRESH_TOKEN_MAX_AGE
        }
      )

      return res.status(200).json({
        data: {
          user: result.user
        }
      })
    } catch (error) {
      res.status(400).json({
        message: 'เกิดข้อผิดพลาด'
      })
    }
  },
  refresh: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken

      if (!refreshToken) {
        return res.status(401).json({
          message: "ไม่พบ Refresh token",
        })
      }

      const result = await authService.refresh({ refreshToken })

      res.cookie(
        "accessToken",
        result.accessToken,
        {
          ...cookieOptions,
          maxAge:
            ACCESS_TOKEN_MAX_AGE,
        }
      )

      res.cookie(
        "refreshToken",
        result.refreshToken,
        {
          ...cookieOptions,
          maxAge:
            REFRESH_TOKEN_MAX_AGE,
        }
      )

      return res.status(200).json({
        message: "Token refreshed",
      })
    } catch (error) {
      return res.status(401).json({
        message:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาด",
      })
    }
  },
  logout: async (req: Request, res: Response) => {
    try {
      const refreshToken =
        req.cookies.refreshToken

      if (refreshToken) {
        await authService.logout(
          refreshToken
        )
      }

      res.clearCookie(
        "accessToken",
        cookieOptions
      )

      res.clearCookie(
        "refreshToken",
        cookieOptions
      )

      return res.status(200).json({
        message:
          "ออกจากระบบเรียบร้อย",
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      })
    }
  },
}

export default AuthController