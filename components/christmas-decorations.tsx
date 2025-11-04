"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"

export function ChristmasDecorations() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || theme !== "christmas") {
    return null
  }

  return (
    <>
      <div className="christmas-tree-left">🎄</div>
      <div className="christmas-tree-right">🎄</div>
      <div className="christmas-star">⭐</div>
      <div className="christmas-gift">🎁</div>
      <div className="christmas-bell">🔔</div>
    </>
  )
}
