import { Router } from "express";
import AuthController from "./auth.controller";
import rateLimit from "express-rate-limit";

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10  
})

router.post('/register', authLimiter, AuthController.register)
router.post('/login', authLimiter, AuthController.login)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)

export default router