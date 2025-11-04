"use client"

import { Ghost, TreePine, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useEffect, useState } from "react"

interface ThemeLogoProps {
  className?: string
}

export function ThemeLogo({ className = "h-5 w-5 text-primary" }: ThemeLogoProps) {
  const { theme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string>("christmas")

  useEffect(() => {
    const savedTheme = localStorage.getItem("sprint-poker-theme") || "christmas"
    setCurrentTheme(theme || savedTheme)
  }, [theme])

  // Return the appropriate icon based on the current theme
  switch (currentTheme) {
    case "halloween":
      return <Ghost className={className} />
    case "christmas":
      return <TreePine className={className} />
    case "dark":
      return <Moon className={className} />
    case "light":
      return <Sun className={className} />
    default:
      return <TreePine className={className} />
  }
}
