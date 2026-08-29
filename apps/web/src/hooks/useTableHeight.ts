"use client"

import { useState, useEffect } from 'react'

export const useTableHeight = () => {
  const [tableHeight, setTableHeight] = useState<string>('')

  const DEFAULT_TABLE_HEADER_HEIGHT = 36
  const DEFAULT_TABLE_FOOTER_HEIGHT = 36

  useEffect(() => {
    const calcHeight = () => {
      const sidebarToggle = document.getElementById('sidebar-toggle')?.offsetHeight || 0
      const headerBox = document.getElementById('header-box')?.offsetHeight || 0
      const tableHeader = document.getElementById('table-header')?.offsetHeight || DEFAULT_TABLE_HEADER_HEIGHT
      const tableFooter = document.getElementById('table-footer')?.offsetHeight || DEFAULT_TABLE_FOOTER_HEIGHT

      const total = `calc(100vh - ${sidebarToggle + headerBox + tableHeader + tableFooter}rem)`
      setTableHeight(total)
    }

    calcHeight()
    window.addEventListener("resize", calcHeight)
    return () => window.removeEventListener("resize", calcHeight)
  }, [])

  return tableHeight
}

