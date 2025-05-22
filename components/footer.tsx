import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-3">
      <div className="gradient-header py-1 mb-2">
        <div className="container h-1"></div>
      </div>
      <div className="container flex items-center justify-center text-sm text-muted-foreground">
        <p className="flex items-center gap-1">
          Creado por Mike con <Heart className="h-3 w-3 fill-primary text-primary" /> con v0
        </p>
      </div>
    </footer>
  )
}
