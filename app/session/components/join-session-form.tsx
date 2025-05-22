"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Eye, Zap } from "lucide-react"
import type { Participant } from "../../actions"

interface JoinSessionFormProps {
  sessionName: string
  sessionCreator: string
  timeRemaining: string
  participants: Participant[]
  onJoin: (name: string, isObserver: boolean) => Promise<void>
  loading: boolean
}

export function JoinSessionForm({
  sessionName,
  sessionCreator,
  timeRemaining,
  participants,
  onJoin,
  loading,
}: JoinSessionFormProps) {
  const [newParticipantName, setNewParticipantName] = useState(() => localStorage.getItem("participantName") || "")
  const [isObserver, setIsObserver] = useState(() => localStorage.getItem("isObserver") === "true")

  const handleJoin = () => {
    if (newParticipantName.trim()) {
      onJoin(newParticipantName, isObserver)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg neon-border cyberpunk-card">
        <CardHeader>
          <CardTitle className="text-2xl neon-text flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Sprint Planning Poker
          </CardTitle>
          <CardDescription>
            Sesión: {sessionName} <br />
            Creada por: {sessionCreator}
            <div className="mt-2 flex items-center gap-1 text-secondary">
              <Eye className="h-4 w-4" />
              Expira en: {timeRemaining}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tu Nombre</Label>
              <Input
                id="name"
                placeholder="Ingresa tu nombre"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="cyberpunk-input"
              />
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <Switch id="observer-mode" checked={isObserver} onCheckedChange={setIsObserver} />
              <Label htmlFor="observer-mode" className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                Unirse como observador
              </Label>
            </div>

            {isObserver && (
              <div className="text-sm text-muted-foreground bg-secondary/10 p-2 rounded-md">
                Como observador, podrás ver los resultados pero no participarás en la votación.
              </div>
            )}

            {participants.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {participants.length} participante(s) ya se han unido:
                </p>
                <div className="flex flex-wrap gap-1">
                  {participants.map((p) => (
                    <span
                      key={p.id}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.isObserver ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {p.name} {p.isObserver && <Eye className="h-3 w-3 inline ml-1" />}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full btn-secondary"
            onClick={handleJoin}
            disabled={loading || !newParticipantName.trim()}
          >
            {loading ? "Uniéndose..." : isObserver ? "Unirse como Observador" : "Unirse a la Sesión"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
