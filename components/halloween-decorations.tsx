"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"

export function HalloweenDecorations() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || theme !== "halloween") {
    return null
  }

  return (
    <>
      <div className="halloween-pumpkin-left">🎃</div>
      <div className="halloween-pumpkin-right">🎃</div>
      <div className="halloween-ghost">👻</div>
      <div className="halloween-spider">🕷️</div>
    </>
  )
}
