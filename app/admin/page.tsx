"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

const ADMIN_PASSWORD = "Admin123$"

type SessionInfo = {
  id: string
  name: string
  createdBy: string
  createdAt: number
  expiresAt: number
  totalPoints: number
  participantCount: number
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      loadSessions()
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Contraseña incorrecta")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
    setSessions([])
  }

  const loadSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error("Error loading sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta sesión?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId))
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Ingresa la contraseña para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
              </div>
              <Button type="submit" className="w-full">
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Panel - Sesiones</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar sesión
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando sesiones...</p>
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay sesiones activas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{session.name}</h3>
                        <span className="text-sm text-muted-foreground">ID: {session.id}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Creado por</p>
                          <p className="font-medium">{session.createdBy}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Participantes</p>
                          <p className="font-medium">{session.participantCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total de puntos</p>
                          <p className="font-medium text-primary">{session.totalPoints}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Creada</p>
                          <p className="font-medium">{formatDate(session.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteSession(session.id)}
                      title="Eliminar sesión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
