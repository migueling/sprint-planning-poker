"use client"

import { Timer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface SessionHeaderProps {
  timeRemaining: string
  isExpiringSoon: boolean
}

export function SessionHeader({ timeRemaining, isExpiringSoon }: SessionHeaderProps) {
  const { toast } = useToast()
  const [shareSuccess, setShareSuccess] = useState(false)

  const handleShareSession = () => {
    try {
      const url = window.location.href
      navigator.clipboard.writeText(url)

      // Mostrar animación de éxito
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)

      toast({
        title: "Enlace copiado",
        description: "El enlace de la sesión ha sido copiado al portapapeles",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error al copiar el enlace:", error)
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
      <div className={`flex items-center gap-2 ${isExpiringSoon ? "text-destructive" : "text-secondary"}`}>
        <Timer className="h-4 w-4" />
        <span>
          {isExpiringSoon ? `¡Atención! La sesión expira en ${timeRemaining}` : `La sesión expira en ${timeRemaining}`}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className={`flex items-center gap-2 ${
            shareSuccess
              ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
              : "bg-primary/10 hover:bg-primary/20 text-primary"
          } transition-colors duration-300`}
          onClick={handleShareSession}
        >
          <Share2 className={`h-4 w-4 ${shareSuccess ? "animate-pulse" : ""}`} />
          {shareSuccess ? "¡Enlace copiado!" : "Compartir sesión"}
        </Button>
      </div>
    </div>
  )
}
