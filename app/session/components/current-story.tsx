"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserStory } from "../../actions"

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
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={storyIndex === totalStories - 1 || loading}
                onClick={onNext}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Historia {storyIndex + 1} de {totalStories}
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
}
