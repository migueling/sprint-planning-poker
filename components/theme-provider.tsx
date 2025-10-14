"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Forzar tema Halloween si no hay ninguno guardado
    const savedTheme = localStorage.getItem("sprint-poker-theme")
    if (!savedTheme) {
      localStorage.setItem("sprint-poker-theme", "halloween")
      document.documentElement.className = "halloween"
    }
  }, [])

  if (!mounted) {
    return null
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export { useTheme } from "next-themes"
