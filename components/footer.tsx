"use client"

import { useI18n } from "@/lib/i18n"

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 backdrop-blur-sm">
      <div className="gradient-header py-1">
        <div className="container h-1"></div>
      </div>
      <div className="container flex items-center justify-center py-6">
        <p className="text-sm text-center text-foreground/80">
          <span>Created with ❤️ by</span>{" "}
          <a
            href="https://www.linkedin.com/in/migueling/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors duration-300"
          >
            Mike
          </a>{" "}
          <span>with</span>{" "}
          <a
            href="https://v0.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors duration-300"
          >
            v0
          </a>
        </p>
      </div>
    </footer>
  )
}
