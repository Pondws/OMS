import {
  Box,
  Layers,
  LayoutGrid,
  Package,
  Tag,
  Puzzle
} from "lucide-react"

export const LAYOUT_OPTIONS = [
  {
    label: '',
    menus: [
      {
        id: "dashboard",
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutGrid,
      },
      {
        id: "product",
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
        ]
      },
      // {
      //   id: "blog",
      //   title: "Blog",
      //   icon: Box,
      //   items: [
      //     {
      //       id: "blog",
      //       title: "Blog",
      //       url: "/blog",
      //       icon: Package,
      //     },
      //     {
      //       id: "blog-tag",
      //       title: "Blog Tag",
      //       url: "/blog-tag",
      //       icon: Tag,
      //     },
      //     // {
      //     //   id: "product-category",
      //     //   title: "Product Category",
      //     //   url: "/product-category",
      //     //   icon: Layers,
      //     // },
      //   ]
      // },
    ]
  }
]