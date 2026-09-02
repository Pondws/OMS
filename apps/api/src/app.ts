import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"

import authRoute from './modules/auth/auth.route'
import userRoute from './modules/user/user.route'
import productTagRoute from './modules/product-tag/product-tag.route'

const app = express()

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoute)
app.use(userRoute)
app.use('/product-tags', productTagRoute)

export default app