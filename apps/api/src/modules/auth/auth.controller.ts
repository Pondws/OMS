import {
  Request,
  Response
} from "express"
import authService from "./auth.service"

const AuthController = {
  register: async (req: Request, res: Response) => {
    try {
      await authService.register(req.body)
      res.status(200).json({ message: "สมัครสมาชิกเรียบร้อย" })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      })
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const result = await authService.login(req.body)

      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000
      })

      return res
        .status(200)
        .json({
          data: {
            user: result.user
          }
        })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      })
    }
  },
  refresh: async (req: Request, res: Response) => {
    try {
      const result = await authService.refresh(req.body)
      return res.status(200).json(result)
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      })
    }
  },
  logout: async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body
      await authService.logout(refreshToken)
      return res.status(200).json({
        message: "ออกจากระบบเรียบร้อย",
      })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      })
    }
  },
}

export default AuthController