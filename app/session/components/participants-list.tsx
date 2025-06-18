"use client"

import { useState } from "react"
import { UserCircle, Eye, Users, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import type { Participant } from "../../actions"
import { useI18n } from "@/lib/i18n"

interface ParticipantsListProps {
  participants: Participant[]
  currentUserId: string
  isOwner: boolean
  shouldShowResults: boolean
  allParticipantsVoted: boolean // Nueva prop para verificar si todos han votado
  onRemoveParticipant: (participantId: string) => void
  loading: boolean
}

export function ParticipantsList({
  participants,
  currentUserId,
  isOwner,
  shouldShowResults,
  allParticipantsVoted, // Nueva prop
  onRemoveParticipant,
  loading,
}: ParticipantsListProps) {
  const { t } = useI18n()
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null)

  const handleRemove = (participant: Participant) => {
    setParticipantToRemove(participant)
  }

  const confirmRemove = () => {
    if (participantToRemove) {
      onRemoveParticipant(participantToRemove.id)
      setParticipantToRemove(null)
    }
  }

  const votedCount = participants.filter((p) => p.vote !== null && !p.isObserver).length
  const totalVoters = participants.filter((p) => !p.isObserver).length

  return (
    <Card className="cyberpunk-card">
      <CardHeader>
        <CardTitle className="text-lg">{t("session.participants.title")}</CardTitle>
        <CardDescription>
          {allParticipantsVoted
            ? t("session.participants.allVoted")
            : t("session.participants.votedCount", {
                voted: votedCount.toString(),
                total: totalVoters.toString(),
              })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <UserCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{participant.name}</span>
                {participant.id === currentUserId && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {t("session.participants.you")}
                  </span>
                )}
                {participant.isObserver && (
                  <span className="ml-2 text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center">
                    <Eye className="h-3 w-3 mr-1" /> {t("home.roles.observer")}
                  </span>
                )}
                {participant.isOwner && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center">
                    <Users className="h-3 w-3 mr-1" /> {t("home.roles.productOwner")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!participant.isObserver && (
                  <>
                    {/* CAMBIO IMPORTANTE: Solo mostrar votos específicos si todos han votado Y se deben mostrar resultados */}
                    {shouldShowResults && allParticipantsVoted ? (
                      <span className="font-medium">
                        {participant.vote === "NA" ? (
                          <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">N/A</span>
                        ) : participant.vote !== null ? (
                          participant.vote
                        ) : (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full dark:bg-amber-900 dark:text-amber-100">
                            {t("session.participants.notVoted")}
                          </span>
                        )}
                      </span>
                    ) : participant.vote !== null ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-100">
                        {t("session.participants.voted")}
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full dark:bg-amber-900 dark:text-amber-100">
                        {t("session.participants.notVoted")}
                      </span>
                    )}
                  </>
                )}

                {(isOwner || participant.id === currentUserId) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-destructive/10"
                        onClick={() => handleRemove(participant)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        <span className="sr-only">{t("common.delete")}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("session.participants.removeParticipant")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("session.participants.removeParticipantConfirm", { name: participant.name })}
                          {participant.id === currentUserId && (
                            <p className="mt-2 font-medium text-destructive">
                              {t("session.participants.removingSelf")}
                            </p>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmRemove}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t("common.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
