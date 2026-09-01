import jwt from 'jsonwebtoken'

type JWTPayload = {
  id: string
  email: string
  role: string
}

const JWTGenerate = {
  accessToken: (payload: JWTPayload) => {
    return jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: "15m"
      }
    )
  },
  verifyAccessToken: (token: string) => {
    return jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    )
  }
}

export default JWTGenerate