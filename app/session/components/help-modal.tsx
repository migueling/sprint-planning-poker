"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Guía de Estimación</DialogTitle>
          <DialogDescription>
            En Planning Poker, usamos la secuencia de Fibonacci para estimar el esfuerzo relativo de las historias de
            usuario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-primary">¿Por qué Fibonacci?</h3>
            <p className="text-sm text-muted-foreground">
              La secuencia de Fibonacci (1, 2, 3, 5, 8, 13) refleja la incertidumbre inherente en las estimaciones:
              cuanto mayor es la estimación, mayor es la incertidumbre.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Significado de los valores</h3>
            <div className="grid gap-2">
              <div className="p-2 border rounded-md">
                <span className="font-bold">1</span>: Tarea muy simple, bien entendida y de rápida implementación.
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">2</span>: Tarea simple con pocos detalles a resolver.
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">3</span>: Tarea de complejidad baja-media, con camino claro.
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">5</span>: Tarea de complejidad media, puede requerir investigación.
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">8</span>: Tarea compleja con varios componentes o incertidumbres.
              </div>
              <div className="p-2 border rounded-md">
                <span className="font-bold">13</span>: Tarea muy compleja, posiblemente debería dividirse en subtareas.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-primary">Consejos para estimar</h3>
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>Estima en términos de complejidad y esfuerzo, no en tiempo.</li>
              <li>Compara con otras historias ya estimadas como referencia.</li>
              <li>Si una historia parece mayor que 13, considera dividirla.</li>
              <li>El consenso del equipo es más importante que la precisión absoluta.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
