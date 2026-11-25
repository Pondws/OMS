import { ALERT_TEXT } from "consts"
import { AlertTextType } from "types"
import type { ProductFormValues } from "./product.schema"

const NAME = "สินค้า"
const PATH = "product"

export const PRODUCT = {
  name: NAME,
  queryKey: {
    all: [PATH] as const,
    list: (params: object) => [PATH, "list", params] as const,
    detail: (id: string) => [PATH, "detail", id] as const,
  },
  text: (action: AlertTextType.ActionProps, status?: AlertTextType.StatusProps) =>
    `${ALERT_TEXT.action[action]}${NAME}${status ? ALERT_TEXT.status[status] : ""}`,
  path: (action?: AlertTextType.PathProps) => (action ? `/${PATH}/${action}` : `/${PATH}`),
  detailPath: (id: string) => `/${PATH}/${id}`,
}

export const MAX_IMAGES = 5
export const MAX_SKUS = 200

export const DEFAULT_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  status: "ACTIVE",
  category: null,
  tags: [],
  images: [],
  options: [],
  imageGroups: [],
  // สินค้าที่ไม่มีตัวเลือกมี SKU เดียว (key ของชุดค่าว่างคือ "")
  skus: [
    {
      variantIds: [],
      sku: "",
      price: "",
      compareAtPrice: "",
      stock: 0,
      weightGrams: null,
      status: "ACTIVE",
    },
  ],
}