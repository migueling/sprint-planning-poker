"use client"

import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-sm text-muted-foreground">{t("footer.copyright", { year: year.toString() })}</p>
      </div>
    </footer>
  )
}
