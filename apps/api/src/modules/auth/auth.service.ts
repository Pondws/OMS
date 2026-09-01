import crypto from "node:crypto"
import bcrypt from 'bcrypt'

import JWTGenerate from '../../lib/jwt'
import authSchema from './auth.schema'

import { prisma } from '../../lib/prisma'
import {
  RegisterInput,
  LoginInput,
  RefreshInput
} from './auth.types'

const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000

const hashToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")
}

const authService = {
  register: async (user: RegisterInput) => {
    const validated = authSchema.register.parse(user)

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    })

    if (existingUser) {
      throw new Error("มีผู้ใช้ในระบบแล้ว")
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12)

    const newUser = await prisma.user.create({
      data: {
        email: validated.email,
        password: hashedPassword,
        name: validated.name,
      },

      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    return newUser
  },
  login: async (data: LoginInput) => {
    const validated = authSchema.login.parse(data)

    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    })

    if (!user) {
      throw new Error("อีเมล์หรือรหัสผ่านไม่ถูกต้อง")
    }

    const match = await bcrypt.compare(validated.password, user.password)

    if (!match) {
      throw new Error("อีเมล์หรือรหัสผ่านไม่ถูกต้อง")
    }

    const accessToken = JWTGenerate.accessToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    const refreshToken = crypto.randomBytes(64).toString("hex")

    const tokenHash = hashToken(refreshToken)

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + REFRESH_TOKEN_EXPIRES_IN
        )
      }
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },

      accessToken,
      refreshToken
    }
  },
  refresh: async (data: RefreshInput) => {
    const validated = authSchema.refresh.parse(data)

    const tokenHash = hashToken(validated.refreshToken)

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        tokenHash
      },

      include: {
        user: true
      }
    })

    if (!storedToken) {
      throw new Error("Invalid refresh token")
    }

    if (storedToken.revokedAt) {
      throw new Error("Refresh token has been revoked")
    }

    if (storedToken.expiresAt < new Date()) {
      throw new Error("Refresh token has expired")
    }

    const user = storedToken.user

    const accessToken = JWTGenerate.accessToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    const newRefreshToken = crypto.randomBytes(64).toString("hex")

    const newTokenHash = hashToken(newRefreshToken)

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: {
          id: storedToken.id,
        },

        data: {
          revokedAt: new Date()
        }
      }),

      prisma.refreshToken.create({
        data: {
          tokenHash: newTokenHash,
          userId: user.id,
          expiresAt: new Date(
            Date.now() +
            REFRESH_TOKEN_EXPIRES_IN,
          ),
        }
      })
    ])

    return {
      accessToken,
      refreshToken: newRefreshToken
    }
  },
  logout: async (refreshToken: string) => {
    const tokenHash = hashToken(refreshToken)

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null
      },

      data: {
        revokedAt: new Date()
      }
    })
  }
}

export default authService