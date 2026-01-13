"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem("sprint-poker-theme")
    if (!savedTheme) {
      localStorage.setItem("sprint-poker-theme", "light")
      document.documentElement.className = "light"
    }
  }, [])

  if (!mounted) {
    return null
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export { useTheme } from "next-themes"
