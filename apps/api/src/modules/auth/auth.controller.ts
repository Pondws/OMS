import {
  Request,
  Response
} from "express"
import authService from "./auth.service"

const AuthController = {
  register: async (req: Request, res: Response) => {
    try {
      const user = await authService.register(req.body)
      res.status(200).json({ message: "สมัครสมาชิกเรียบร้อย" })
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      })
    }
  }
}

export default AuthController