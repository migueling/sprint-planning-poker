"use client"

import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

interface NoStoriesMessageProps {
  isOwner: boolean
  onNavigateToManage?: () => void
}

export function NoStoriesMessage({ isOwner, onNavigateToManage }: NoStoriesMessageProps) {
  const { t } = useI18n()

  return (
    <Card className="cyberpunk-card">
      <CardHeader>
        <CardTitle>{t("session.noStories.title")}</CardTitle>
        <CardDescription>
          {isOwner
            ? `Como ${t("home.roles.productOwner")}, puedes crear una nueva historia para comenzar la votación.`
            : `El ${t("home.roles.productOwner")} aún no ha creado ninguna historia para votar.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="text-center mb-6">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isOwner
              ? "Para comenzar, crea una historia de usuario en la pestaña de Gestión."
              : `Espera a que el ${t("home.roles.productOwner")} cree una historia para comenzar la votación.`}
          </p>
        </div>
        {isOwner && onNavigateToManage && (
          <Button onClick={onNavigateToManage} className="btn-primary">
            {t("session.noStories.goToManage")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
