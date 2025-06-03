"use client"

import { Zap } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { LanguageToggle } from "./language-toggle"
import { useI18n } from "@/lib/i18n"

export function Header() {
  const { t } = useI18n()

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="gradient-header py-1">
        <div className="container h-1"></div>
      </div>
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          <span className="glitch-text text-xl">{t("header.title")}</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
