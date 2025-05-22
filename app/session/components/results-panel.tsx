"use client"

import { RefreshCw, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Participant } from "../../actions"

interface ResultsPanelProps {
  participants: Participant[]
  shouldShowResults: boolean
  hasFullConsensus: boolean
  consensusValue: number | null
  consensusPercentage: number | null
  average: number
  isOwner: boolean
  onResetVotes: () => void
  loading: boolean
}

export function ResultsPanel({
  participants,
  shouldShowResults,
  hasFullConsensus,
  consensusValue,
  consensusPercentage,
  average,
  isOwner,
  onResetVotes,
  loading,
}: ResultsPanelProps) {
  return (
    <Card className={`cyberpunk-card ${hasFullConsensus ? "animate-pulse border-2 border-primary" : ""}`}>
      <CardHeader>
        <CardTitle className="text-lg neon-text">{hasFullConsensus ? "¡Consenso Total! 🎉" : "Resultados"}</CardTitle>
        <CardDescription>
          {shouldShowResults
            ? hasFullConsensus
              ? `¡Todos han votado ${consensusValue}!`
              : "Resultados de la votación actual"
            : "Los resultados se mostrarán cuando todos hayan votado"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {shouldShowResults ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-primary/20 rounded-lg bg-accent/30">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Promedio</h3>
                <p className="text-3xl font-bold text-primary neon-text">{average}</p>
              </div>
              <div
                className={`p-4 border-2 ${
                  hasFullConsensus ? "border-primary animate-pulse" : "border-secondary/20"
                } rounded-lg bg-accent/30`}
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Consenso</h3>
                <p
                  className={`text-3xl font-bold ${
                    hasFullConsensus ? "text-primary neon-text" : "text-secondary neon-text-secondary"
                  }`}
                >
                  {consensusValue}
                  <span className="text-base font-normal text-muted-foreground ml-1">({consensusPercentage}%)</span>
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              {isOwner && (
                <Button variant="outline" className="btn-outline" onClick={onResetVotes} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reiniciar Votos
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                Esperando a que todos los participantes voten para mostrar los resultados
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
