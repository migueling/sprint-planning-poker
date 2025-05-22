"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Zap, Plus, LogIn } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { createSession } from "./actions"

// Fibonacci sequence for voting
const FIBONACCI_SEQUENCE = [1, 2, 3, 5, 8, 13, 21]

export default function HomePage() {
  const router = useRouter()
  const [newSessionName, setNewSessionName] = useState("")
  const [creatorName, setCreatorName] = useState("")
  const [joinSessionId, setJoinSessionId] = useState("")
  const [participantName, setParticipantName] = useState("")
  const [isObserver, setIsObserver] = useState(false)
  const [loading, setLoading] = useState(false)

  // Efecto para añadir scanlines (solo visible en modo oscuro)
  useEffect(() => {
    const scanlines = document.createElement("div")
    scanlines.className = "scanlines"
    document.body.appendChild(scanlines)

    return () => {
      document.body.removeChild(scanlines)
    }
  }, [])

  useEffect(() => {
    // Cargar nombres guardados desde localStorage si existen
    const savedCreatorName = localStorage.getItem("creatorName")
    if (savedCreatorName) {
      setCreatorName(savedCreatorName)
    }

    const savedParticipantName = localStorage.getItem("participantName")
    if (savedParticipantName) {
      setParticipantName(savedParticipantName)
    }
  }, [])

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || !creatorName.trim()) return

    try {
      setLoading(true)

      // Guardar el nombre del creador en localStorage
      localStorage.setItem("creatorName", creatorName)

      const { sessionId, ownerId } = await createSession(newSessionName, creatorName)

      // Guardar el ID del propietario en localStorage
      localStorage.setItem("ownerId", ownerId)

      router.push(`/session/${sessionId}`)
    } catch (error) {
      console.error("Error creating session:", error)
      setLoading(false)
    }
  }

  const handleJoinSession = () => {
    if (joinSessionId.trim() && participantName.trim()) {
      localStorage.setItem("participantName", participantName)
      localStorage.setItem("isObserver", isObserver.toString())
      router.push(`/session/${joinSessionId.trim()}`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-7.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 neon-text">Cargando...</h2>
          <p className="text-muted-foreground">Inicializando la sesión de Planning Poker</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-4xl font-bold glitch-text mb-2 flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          Sprint Planning Poker
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          Herramienta para votación de historias de usuario en un Sprint. Crea una sesión, comparte el enlace con tu
          equipo y comienza a votar. Las sesiones expiran después de 12 horas.
        </p>

        <Tabs defaultValue="create" className="w-full max-w-3xl">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="create">Crear Nueva Sesión</TabsTrigger>
            <TabsTrigger value="join">Unirse a una Sesión</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="cyberpunk-card">
              <CardHeader>
                <CardTitle>Crear Nueva Sesión</CardTitle>
                <CardDescription>Crea una nueva sesión de Planning Poker para tu equipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-name">Nombre de la Sesión</Label>
                    <Input
                      id="session-name"
                      placeholder="Ej: Sprint 23 Planning"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      className="cyberpunk-input"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="creator-name">Tu Nombre (Product Owner)</Label>
                    <Input
                      id="creator-name"
                      placeholder="Ej: Juan Pérez"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="cyberpunk-input"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-md mt-2">
                    <p>
                      Como Product Owner, serás añadido automáticamente como observador y podrás gestionar las historias
                      de usuario. La sesión expirará automáticamente después de 12 horas.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full btn-primary"
                  onClick={handleCreateSession}
                  disabled={loading || !newSessionName.trim() || !creatorName.trim()}
                >
                  {loading ? "Creando..." : "Crear Sesión"}
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card className="cyberpunk-card">
              <CardHeader>
                <CardTitle>Unirse a una Sesión</CardTitle>
                <CardDescription>Ingresa el ID de la sesión a la que quieres unirte</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-id">ID de la Sesión</Label>
                    <Input
                      id="session-id"
                      placeholder="Ej: abc123xyz"
                      value={joinSessionId}
                      onChange={(e) => setJoinSessionId(e.target.value)}
                      className="cyberpunk-input"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="participant-name">Tu Nombre</Label>
                    <Input
                      id="participant-name"
                      placeholder="Ej: Ana García"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
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
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full btn-secondary"
                  onClick={handleJoinSession}
                  disabled={loading || !joinSessionId.trim() || !participantName.trim()}
                >
                  Unirse a la Sesión
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
