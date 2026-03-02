"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { AlertTriangle, Plus, RefreshCw, Trash2, Play, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { EditableStoryTitle } from "./editable-story-title"
import type { UserStory } from "../../actions"
import { useI18n } from "@/lib/i18n"

interface ManageStoriesTabProps {
  userStories: UserStory[]
  activeStoryIndex: number
  onChangeStory: (index: number) => void
  onRemoveStory: (index: number) => void
  onRemoveAllStories: () => void
  onAddStory: (title: string) => void
  onUpdateStory: (storyIndex: number, newTitle: string) => Promise<boolean>
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
  onUpdateStory,
  onResetVotes,
  loading,
}: ManageStoriesTabProps) {
  const { t } = useI18n()
  const [newStoryTitle, setNewStoryTitle] = useState("")
  const [storyToRemove, setStoryToRemove] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const shouldRefocusRef = useRef(false)

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Re-focus the input after loading finishes (from adding a story)
  useEffect(() => {
    if (!loading && shouldRefocusRef.current) {
      shouldRefocusRef.current = false
      inputRef.current?.focus()
    }
  }, [loading])

  const handleAddStory = () => {
    if (newStoryTitle.trim()) {
      shouldRefocusRef.current = true
      onAddStory(newStoryTitle)
      setNewStoryTitle("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddStory()
    }
  }

  return (
    <div className="grid gap-6">
      {/* Unified stories card */}
      <Card className="cyberpunk-card">
        <CardHeader className="pb-4">
          <CardTitle>{t("session.manage.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick-add input at the top */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder={t("session.manage.quickAddPlaceholder")}
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="cyberpunk-input flex-1"
              disabled={loading}
            />
            <Button
              size="icon"
              className="btn-secondary shrink-0"
              onClick={handleAddStory}
              disabled={loading || !newStoryTitle.trim()}
              aria-label={t("session.manage.add")}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Stories list */}
          {userStories.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
              <p className="text-muted-foreground text-sm">
                {t("session.manage.emptyListHint")}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {userStories.map((story, index) => {
                const isActive = index === activeStoryIndex
                return (
                  <div
                    key={story.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    }`}
                  >
                    {/* Story number */}
                    <span className="text-xs font-mono text-muted-foreground w-6 shrink-0 text-right">
                      {index + 1}.
                    </span>

                    {/* Story title (editable) */}
                    <div className="flex-1 min-w-0">
                      <EditableStoryTitle
                        title={story.title}
                        storyIndex={index}
                        isOwner={true}
                        hasVotes={false}
                        onUpdate={onUpdateStory}
                        loading={loading}
                      />
                    </div>

                    {/* Points badge */}
                    {story.points != null && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full shrink-0 whitespace-nowrap">
                        <Check className="h-3 w-3" />
                        {story.points} {t("session.manage.pointsLabel")}
                      </span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-primary"
                          onClick={() => onChangeStory(index)}
                          disabled={loading}
                          title={t("session.manage.setActive")}
                        >
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {isActive && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                          {t("session.manage.activeLabel")}
                        </span>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground hover:text-destructive"
                            disabled={userStories.length <= 1 || loading}
                            onClick={() => setStoryToRemove(index)}
                            title={t("session.manage.deleteStory")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("session.manage.deleteStory")}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("session.manage.confirmDelete")} &quot;{story.title}&quot;?
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
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session controls - compact, no card wrapper */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="flex-1 btn-outline bg-transparent"
          onClick={onResetVotes}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("session.results.resetVotes")}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
              disabled={userStories.length <= 1 || loading}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t("session.manage.deleteAllStories")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("session.manage.deleteAllStories")}?</AlertDialogTitle>
              <AlertDialogDescription>
                {t("session.manage.confirmDeleteAll")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onRemoveAllStories()
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
