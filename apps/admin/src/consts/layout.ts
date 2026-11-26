import {
  Box,
  Boxes,
  // History,
  Layers,
  LayoutGrid,
  Package,
  Tag,
  Puzzle,
  User,
  Warehouse,
} from "lucide-react"

export const LAYOUT_OPTIONS = [
  {
    label: "",
    menus: [
      {
        id: "dashboard",
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutGrid,
      },
      {
        id: "product-group",
        title: "สินค้า",
        icon: Box,
        items: [
          {
            id: "product",
            title: "สินค้า",
            url: "/product",
            icon: Package,
          },
          {
            id: "product-variant",
            title: "ตัวเลือกสินค้า",
            url: "/product-variant",
            icon: Puzzle,
          },
          {
            id: "product-tag",
            title: "แท็กสินค้า",
            url: "/product-tag",
            icon: Tag,
          },
          {
            id: "product-category",
            title: "หมวดหมู่สินค้า",
            url: "/product-category",
            icon: Layers,
          },
        ],
      },
      {
        id: "inventory-group",
        title: "คลังสินค้า",
        icon: Warehouse,
        items: [
          {
            id: "inventory",
            title: "สต็อกสินค้า",
            url: "/inventory",
            icon: Boxes,
          },
          // {
          //   id: "inventory-movement",
          //   title: "ประวัติสต็อก",
          //   url: "/inventory/movement",
          //   icon: History,
          // },
        ],
      },
      {
        id: "user",
        title: "ผู้ใช้งาน",
        url: "/user",
        icon: User,
      },
    ],
  },
]