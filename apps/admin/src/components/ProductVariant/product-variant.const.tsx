import { ALERT_TEXT } from "consts"
import { AlertTextType } from "types"

const NAME = "ตัวเลือกสินค้า"
const PATH = "product-variant"

export const PRODUCT_VARIANT = {
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