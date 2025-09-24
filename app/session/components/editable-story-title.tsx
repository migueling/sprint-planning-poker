"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Check, X } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface EditableStoryTitleProps {
  title: string
  storyIndex: number
  isOwner: boolean
  hasVotes: boolean
  onUpdate: (storyIndex: number, newTitle: string) => Promise<boolean>
  loading: boolean
}

export function EditableStoryTitle({
  title,
  storyIndex,
  isOwner,
  hasVotes,
  onUpdate,
  loading,
}: EditableStoryTitleProps) {
  const { t } = useI18n()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStartEdit = () => {
    if (!isOwner || hasVotes || loading) return
    setEditValue(title)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editValue.trim() || editValue.trim() === title) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    const success = await onUpdate(storyIndex, editValue.trim())

    if (success) {
      setIsEditing(false)
    }
    setIsUpdating(false)
  }

  const handleCancel = () => {
    setEditValue(title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 group">
        <h3 className="font-medium text-secondary flex-1">{title}</h3>
        {isOwner && !hasVotes && !loading && (
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            onClick={handleStartEdit}
            title="Editar historia"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 h-8"
        placeholder="Título de la historia"
        disabled={isUpdating}
        autoFocus
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={handleSave}
        disabled={isUpdating || !editValue.trim()}
        title="Guardar cambios"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={handleCancel}
        disabled={isUpdating}
        title="Cancelar edición"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
