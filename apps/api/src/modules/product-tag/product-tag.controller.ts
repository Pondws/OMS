import { Request, Response } from "express"
import productTagService from "./product-tag.service"
import { ProductTagParams } from "./product-tag.type"

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
  findAll: async (req: Request, res: Response) => {
    try {

    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
      })
    }
  },
  findById: async (req: Request<ProductTagParams>, res: Response) => {
    try {
      const productTag = productTagService.findById(req.params.id)
      
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
  update: async (req: Request, res: Response) => {
    try {

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