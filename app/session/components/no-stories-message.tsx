"use client"

import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NoStoriesMessageProps {
  isOwner: boolean
  onNavigateToManage?: () => void
}

export function NoStoriesMessage({ isOwner, onNavigateToManage }: NoStoriesMessageProps) {
  return (
    <Card className="cyberpunk-card">
      <CardHeader>
        <CardTitle>No hay historias disponibles</CardTitle>
        <CardDescription>
          {isOwner
            ? "Como Product Owner, puedes crear una nueva historia para comenzar la votación."
            : "El Product Owner aún no ha creado ninguna historia para votar."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="text-center mb-6">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isOwner
              ? "Para comenzar, crea una historia de usuario en la pestaña de Gestión."
              : "Espera a que el Product Owner cree una historia para comenzar la votación."}
          </p>
        </div>
        {isOwner && onNavigateToManage && (
          <Button onClick={onNavigateToManage} className="btn-primary">
            Ir a Gestión para crear historias
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
