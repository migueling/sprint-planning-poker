"use client"

import { useState } from "react"
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { UserStory } from "../../actions"
import { useI18n } from "@/lib/i18n"

interface ManageStoriesTabProps {
  userStories: UserStory[]
  activeStoryIndex: number
  onChangeStory: (index: number) => void
  onRemoveStory: (index: number) => void
  onRemoveAllStories: () => void
  onAddStory: (title: string) => void
  onResetVotes: () => void
  loading: boolean
}

export function ManageStoriesTab({
  userStories,
  activeStoryIndex,
  onChangeStory,
  onRemoveStory,
  onRemoveAllStories,
  onAddStory,
  onResetVotes,
  loading,
}: ManageStoriesTabProps) {
  const { t } = useI18n()
  const [newStoryTitle, setNewStoryTitle] = useState("")
  const [storyToRemove, setStoryToRemove] = useState<number | null>(null)
  const [isRemovingAllStories, setIsRemovingAllStories] = useState(false)

  const handleAddStory = () => {
    if (newStoryTitle.trim()) {
      onAddStory(newStoryTitle)
      setNewStoryTitle("")
    }
  }

  const activeStory = userStories.length > 0 && activeStoryIndex >= 0 ? userStories[activeStoryIndex] : null

  return (
    <div className="grid gap-6">
      <Card className="cyberpunk-card">
        <CardHeader>
          <CardTitle>{t("session.currentStory.title")}</CardTitle>
          <CardDescription>
            {userStories.length === 0
              ? t("session.manage.noStories")
              : t("session.currentStory.storyCount", {
                  current: (activeStoryIndex + 1).toString(),
                  total: userStories.length.toString(),
                })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userStories.length === 0 ? (
            <div className="p-4 border-2 border-amber-500/20 rounded-lg bg-accent/30 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-medium text-amber-500">{t("session.manage.noStories")}</h3>
              <p className="text-muted-foreground mt-1">
                {t("session.manage.addStory")} utilizando el formulario de abajo.
              </p>
            </div>
          ) : (
            <div className="p-4 border-2 border-secondary/20 rounded-lg bg-accent/30">
              <h3 className="font-medium text-secondary">{activeStory?.title}</h3>
            </div>
          )}
        </CardContent>
        {userStories.length > 0 && (
          <CardFooter className="flex flex-wrap justify-between gap-4">
            <Button
              variant="outline"
              className="flex-1 btn-outline"
              disabled={activeStoryIndex === 0 || loading}
              onClick={() => onChangeStory(activeStoryIndex - 1)}
            >
              {t("session.currentStory.previous")}
            </Button>
            <Button
              variant="outline"
              className="flex-1 btn-outline"
              disabled={activeStoryIndex === userStories.length - 1 || loading}
              onClick={() => onChangeStory(activeStoryIndex + 1)}
            >
              {t("session.currentStory.next")}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                  disabled={userStories.length <= 1 || loading}
                  onClick={() => setStoryToRemove(activeStoryIndex)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("session.manage.deleteStory")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("session.manage.deleteStory")}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("session.manage.confirmDelete")} "{activeStory?.title}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (storyToRemove !== null) {
                        onRemoveStory(storyToRemove)
                        setStoryToRemove(null)
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t("common.delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        )}
      </Card>

      <Card className="cyberpunk-card">
        <CardHeader>
          <CardTitle>{t("session.manage.addStory")}</CardTitle>
          <CardDescription>Crea una nueva historia de usuario para estimar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="story-title">{t("session.manage.storyTitle")}</Label>
              <Input
                id="story-title"
                placeholder="Ingresa el título de la historia"
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                className="cyberpunk-input"
                onKeyDown={(e) => e.key === "Enter" && handleAddStory()}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full btn-secondary" onClick={handleAddStory} disabled={loading || !newStoryTitle.trim()}>
            {t("session.manage.add")}
          </Button>
        </CardFooter>
      </Card>

      <Card className="cyberpunk-card">
        <CardHeader>
          <CardTitle>Controles de Sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full btn-outline" onClick={onResetVotes} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("session.results.resetVotes")}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                disabled={userStories.length <= 1 || loading}
                onClick={() => setIsRemovingAllStories(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Eliminar Todas las Historias
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar todas las historias?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas eliminar todas las historias excepto la primera? Esta acción no se puede
                  deshacer y se perderán todas las historias actuales.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onRemoveAllStories()
                    setIsRemovingAllStories(false)
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("common.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
