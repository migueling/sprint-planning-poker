import { Zap } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="gradient-header py-1">
        <div className="container h-1"></div>
      </div>
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 font-semibold">
          <Zap className="h-5 w-5 text-primary" />
          <span className="glitch-text text-xl">Sprint Planning Poker</span>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
