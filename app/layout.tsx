import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/lib/i18n"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HalloweenDecorations } from "@/components/halloween-decorations"
import { ChristmasDecorations } from "@/components/christmas-decorations"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sprint Planning Poker",
  description: "Herramienta para votación de historias de usuario en un Sprint",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="christmas">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              const theme = localStorage.getItem('sprint-poker-theme') || 'christmas';
              document.documentElement.className = theme;
            } catch (e) {
              document.documentElement.className = 'christmas';
            }
          `}
        </Script>
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="christmas"
            enableSystem={false}
            storageKey="sprint-poker-theme"
          >
            <div className="relative flex min-h-screen flex-col">
              <HalloweenDecorations />
              <ChristmasDecorations />
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
