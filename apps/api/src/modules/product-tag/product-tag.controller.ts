import { Request, Response } from "express"
import productTagService from "./product-tag.service"
import { ProductTagParams } from "./product-tag.type"
import { asyncHandler } from "../../middlewares/async-handler"
import { getSearchOptionsSchema } from "../../shard/schemas/get-search-options"

const productTagController = {
  create: async (req: Request, res: Response) => {
    try {
      const productTag = await productTagService.create(req.body)
      res.status(201).json({ data: productTag })
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      })
    }
  },
  getAll: async (req: Request, res: Response) => {
    try {
      const productTags = await productTagService.getAll(req.query)

      res.json({
        data: productTags
      })
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      })
    }
  },
  getById: async (req: Request<ProductTagParams>, res: Response) => {
    try {
      const productTag = await productTagService.getById(req.params.id)

      if (!productTag) {
        throw new Error("ไม่พบแท็กสินค้า")
      }

      res.json({
        data: productTag
      })
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      })
    }
  },
  getOptions: asyncHandler(async (req, res) => {
    const query = getSearchOptionsSchema.parse(req.query)

    const data = await productTagService.getOptions(query)

    res.json(data)
  }),
  update: async (req: Request<ProductTagParams>, res: Response) => {
    try {
      const productTag = await productTagService.update(req.params.id, req.body)

      res.status(200).json({
        data: productTag
      })
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      })
    }
  }
  ,
  delete: async (req: Request<ProductTagParams>, res: Response) => {
    try {
      await productTagService.delete(req.params.id)
      res.status(204).json({
        message: "ลบแท็กสินค้าเรียบร้อย"
      })
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      })
    }
  }
}

export default productTagController