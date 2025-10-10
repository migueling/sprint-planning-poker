"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Ghost, Plus, LogIn } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { createSession } from "./actions"
import { useI18n } from "@/lib/i18n"

export default function HomePage() {
  const router = useRouter()
  const { t } = useI18n()
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
          <h2 className="text-xl font-semibold mb-2 neon-text">{t("common.loading")}</h2>
          <p className="text-muted-foreground">{t("home.subtitle")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-4xl font-bold glitch-text mb-2 flex items-center gap-2">
          <Ghost className="h-8 w-8 text-primary" />
          {t("home.title")}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mb-8">
          {t("home.subtitle")}. {t("home.description")}
        </p>

        <Tabs defaultValue="create" className="w-full max-w-3xl">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="create">{t("home.createSession")}</TabsTrigger>
            <TabsTrigger value="join">{t("home.joinSession")}</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="cyberpunk-card">
              <CardHeader>
                <CardTitle>{t("home.createSession")}</CardTitle>
                <CardDescription>{t("home.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-name">{t("home.sessionName")}</Label>
                    <Input
                      id="session-name"
                      placeholder={t("home.sessionNamePlaceholder")}
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      className="cyberpunk-input"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="creator-name">
                      {t("home.yourName")} ({t("home.roles.productOwner")})
                    </Label>
                    <Input
                      id="creator-name"
                      placeholder={t("home.yourNamePlaceholder")}
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="cyberpunk-input"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground bg-secondary/10 p-3 rounded-md mt-2">
                    <p>{t("home.productOwnerInfo")}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full btn-primary"
                  onClick={handleCreateSession}
                  disabled={loading || !newSessionName.trim() || !creatorName.trim()}
                >
                  {loading ? t("common.loading") : t("home.create")}
                  <Plus className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card className="cyberpunk-card">
              <CardHeader>
                <CardTitle>{t("home.joinSession")}</CardTitle>
                <CardDescription>{t("home.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-id">{t("home.sessionId")}</Label>
                    <Input
                      id="session-id"
                      placeholder={t("home.sessionIdPlaceholder")}
                      value={joinSessionId}
                      onChange={(e) => setJoinSessionId(e.target.value)}
                      className="cyberpunk-input"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="participant-name">{t("home.yourName")}</Label>
                    <Input
                      id="participant-name"
                      placeholder={t("home.participantNamePlaceholder")}
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      className="cyberpunk-input"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch id="observer-mode" checked={isObserver} onCheckedChange={setIsObserver} />
                    <Label htmlFor="observer-mode" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {t("home.joinAsObserver")}
                    </Label>
                  </div>

                  {isObserver && (
                    <div className="text-sm text-muted-foreground bg-secondary/10 p-2 rounded-md">
                      {t("home.observerInfo")}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full btn-secondary"
                  onClick={handleJoinSession}
                  disabled={loading || !joinSessionId.trim() || !participantName.trim()}
                >
                  {loading ? t("common.loading") : t("home.join")}
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
