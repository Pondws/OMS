import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"

import authRoute from './modules/auth/auth.route'
import userRoute from './modules/user/user.route'
import productTagRoute from './modules/product-tag/product-tag.route'
import productCategoryRoute from './modules/product-category/product-category.route'
import { errorHandler } from './middlewares/error-handler'

const app = express()

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/auth', authRoute)
app.use(userRoute)
app.use('/product-categories', productCategoryRoute)
app.use('/product-tags', productTagRoute)

app.use(errorHandler)

export default app