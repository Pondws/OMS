export const LOW_STOCK = 5

export const INVENTORY = {
  name: "สต็อกสินค้า",
  path: () => "/inventory",
  queryKey: {
    all: ["inventory"] as const,
    list: (params: object) => ["inventory", "list", params] as const,
  },
}

export const STOCK_STATUS_OPTIONS = [
  { label: "ทุกสถานะสต็อก", value: "IN_STOCK" },
  { label: `ใกล้หมด (≤ ${LOW_STOCK})`, value: "LOW_STOCK" },
  { label: "หมด", value: "OUT_OF_STOCK" },
]