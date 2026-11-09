import {
  Request,
  Response,
  CookieOptions,
  NextFunction
} from "express"
import authService from "./auth.service"
import authSchema from "./auth.schema"

const ACCESS_TOKEN_MAX_AGE =
  15 * 60 * 1000

const REFRESH_TOKEN_MAX_AGE =
  7 * 24 * 60 * 60 * 1000

const cookieOptions: CookieOptions = {
  httpOnly: true,
  // secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
}

const accessCookie: CookieOptions = {
  ...cookieOptions,
  path: "/",
}

const refreshCookie: CookieOptions = {
  ...cookieOptions,
  path: "/auth",
}

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, { ...accessCookie, maxAge: ACCESS_TOKEN_MAX_AGE })
  res.cookie("refreshToken", refreshToken, { ...refreshCookie, maxAge: REFRESH_TOKEN_MAX_AGE })
}

const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", accessCookie)
  res.clearCookie("refreshToken", refreshCookie)
}

const AuthController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = authSchema.register.parse(req.body)
      await authService.register(body)
      return res.status(201).json({ message: "สมัครสมาชิกเรียบร้อย" })
    } catch (error) {
      next(error)
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = authSchema.login.parse(req.body)
      const result = await authService.login(body)
      setAuthCookies(res, result.accessToken, result.refreshToken)
      return res.status(200).json({ data: { user: result.user } })
    } catch (error) {
      next(error)
    }
  },
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        return res.status(401).json({ message: "ไม่พบ Refresh token" })
      }

      const result = await authService.refresh({ refreshToken })
      setAuthCookies(res, result.accessToken, result.refreshToken)
      return res.status(200).json({ message: "Token refreshed" })
    } catch (error) {
      clearAuthCookies(res)   // token ใช้ไม่ได้แล้ว ล้างทิ้งด้วย
      next(error)
    }
  },
  logout: async (req: Request, res: Response, _: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (error) {
      console.error(error)
    } finally {
      clearAuthCookies(res)
    }
    return res.status(200).json({ message: "ออกจากระบบเรียบร้อย" })
  },
}

export default AuthController