"use client"

import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useState } from "react"
import { HelpModal } from "./help-modal"
import { useI18n } from "@/lib/i18n"

interface VotingCardsProps {
  currentVote: number | "NA" | null
  onVote: (value: number | "NA") => void
  loading: boolean
}

// Fibonacci sequence for voting (eliminando el 21)
const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13]

export function VotingCards({ currentVote, onVote, loading }: VotingCardsProps) {
  const { t } = useI18n()
  const [showHelpModal, setShowHelpModal] = useState(false)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{t("session.votingCards.title")}</h3>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => setShowHelpModal(true)}
        >
          <HelpCircle className="h-4 w-4" />
          <span>{t("session.votingCards.help")}</span>
        </Button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
        {FIBONACCI_SEQUENCE.map((value) => (
          <Button
            key={value}
            variant={currentVote === value ? "default" : "outline"}
            className={`h-16 text-lg font-bold vote-card ${currentVote === value ? "vote-card-selected" : ""}`}
            onClick={() => onVote(value)}
            disabled={loading}
          >
            {value}
          </Button>
        ))}
      </div>

      {currentVote && (
        <div className="mt-4 p-3 bg-primary/10 rounded-md text-center">
          <p className="text-sm">{t("session.votingCards.voted", { value: currentVote.toString() })}</p>
        </div>
      )}

      <HelpModal open={showHelpModal} onOpenChange={setShowHelpModal} />
    </div>
  )
}
