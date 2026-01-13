"use client"
import { Moon, Sun, Ghost, TreePine } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>("light")

  useEffect(() => {
    setMounted(true)

    const savedTheme = localStorage.getItem("sprint-poker-theme") || "light"
    setCurrentTheme(savedTheme)

    if (!theme || theme === "system") {
      setTheme("light")
      document.documentElement.className = "light"
    } else {
      setCurrentTheme(theme)
    }
  }, [theme, setTheme])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setCurrentTheme(newTheme)
    // Forzar recarga de estilos
    setTimeout(() => {
      document.documentElement.className = newTheme
    }, 0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {currentTheme === "light" && <Sun className="h-4 w-4" />}
          {currentTheme === "dark" && <Moon className="h-4 w-4" />}
          {currentTheme === "halloween" && <Ghost className="h-4 w-4" />}
          {currentTheme === "christmas" && <TreePine className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="h-4 w-4 mr-2" />
          {currentTheme === "light" && "✓ "}
          {t("theme.light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          {currentTheme === "dark" && "✓ "}
          {t("theme.dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("halloween")}>
          <Ghost className="h-4 w-4 mr-2" />
          {currentTheme === "halloween" && "✓ "}
          Halloween
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("christmas")}>
          <TreePine className="h-4 w-4 mr-2" />
          {currentTheme === "christmas" && "✓ "}
          Christmas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
