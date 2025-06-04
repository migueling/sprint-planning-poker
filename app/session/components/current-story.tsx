"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserStory } from "../../actions"
import { useI18n } from "@/lib/i18n"

interface CurrentStoryProps {
  story: UserStory
  storyIndex: number
  totalStories: number
  isOwner: boolean
  onPrevious: () => void
  onNext: () => void
  children?: React.ReactNode
  loading: boolean
}

export function CurrentStory({
  story,
  storyIndex,
  totalStories,
  isOwner,
  onPrevious,
  onNext,
  children,
  loading,
}: CurrentStoryProps) {
  const { t } = useI18n()

  return (
    <Card className="cyberpunk-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{story.title}</CardTitle>
          </div>
          {totalStories > 1 && isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={storyIndex === 0 || loading}
                onClick={onPrevious}
              >
                {t("session.currentStory.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={storyIndex === totalStories - 1 || loading}
                onClick={onNext}
              >
                {t("session.currentStory.next")}
              </Button>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {t("session.currentStory.storyCount", {
            current: (storyIndex + 1).toString(),
            total: totalStories.toString(),
          })}
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
}
