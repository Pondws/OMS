import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser"
import { toNodeHandler } from "better-auth/node";
import { auth } from "../src/lib/auth"

import authRoute from './modules/auth/auth.route'
import userRoute from './modules/user/user.route'
import productTagRoute from './modules/product-tag/product-tag.route'
import productCategoryRoute from './modules/product-category/product-category.route'
import productVariantRoute from './modules/product-variant/product-variant.route'
import productRoute from './modules/product/product.route'
import uploadImageRoute from './modules/upload-image/upload-image.route'
import { errorHandler } from './middlewares/error-handler'

const app = express()

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}))

app.all('/api/auth/{*any}', toNodeHandler(auth))

app.use(express.json())
app.use(cookieParser())

// app.use('/auth', authRoute)
app.use(userRoute)
app.use('/', uploadImageRoute)
app.use('/product-categories', productCategoryRoute)
app.use('/product-tags', productTagRoute)
app.use('/product-variants', productVariantRoute)
app.use('/products', productRoute)

app.use(errorHandler)

export default app