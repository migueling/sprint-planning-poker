"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { useSession } from "../hooks/use-session"
import { SessionHeader } from "../components/session-header"
import { JoinSessionForm } from "../components/join-session-form"
import { UserInfo } from "../components/user-info"
import { NoStoriesMessage } from "../components/no-stories-message"
import { CurrentStory } from "../components/current-story"
import { VotingCards } from "../components/voting-cards"
import { ParticipantsList } from "../components/participants-list"
import { ResultsPanel } from "../components/results-panel"
import { ManageStoriesTab } from "../components/manage-stories-tab"
import { Confetti } from "@/components/confetti"

export default function SessionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const {
    sessionState,
    currentUser,
    loading,
    isOwner,
    showFireworks,
    timeRemaining,
    isExpiringSoon,
    shouldShowResults,
    consensus,
    hasFullConsensus,
    activeStory,
    handleJoin,
    handleVote,
    handleResetVotes,
    handleAddNewStory,
    handleChangeStory,
    handleRemoveParticipant,
    handleRemoveStory,
    handleRemoveAllStories,
    calculateAverage,
  } = useSession(params.id)

  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState<string>("main")

  // Efecto para dirigir al PO a la pestaña "Gestionar" cuando se une
  useEffect(() => {
    if (currentUser && isOwner && sessionState?.userStories.length === 0) {
      setActiveTab("manage")
    }
  }, [currentUser, isOwner, sessionState?.userStories.length])

  // Efecto para añadir scanlines (solo visible en modo oscuro)
  useState(() => {
    const scanlines = document.createElement("div")
    scanlines.className = "scanlines"
    document.body.appendChild(scanlines)

    return () => {
      document.body.removeChild(scanlines)
    }
  })

  if (loading && !sessionState) {
    return (
      <div className="flex min-h-[calc(100vh-7.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 neon-text">Cargando...</h2>
          <p className="text-muted-foreground">Inicializando la sesión de Planning Poker</p>
        </div>
      </div>
    )
  }

  if (!sessionState) {
    return (
      <div className="flex min-h-[calc(100vh-7.5rem)] items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-destructive/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">Sesión no encontrada</CardTitle>
            <CardDescription>La sesión que intentas acceder no existe o ha sido eliminada</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <JoinSessionForm
        sessionName={sessionState.name}
        sessionCreator={sessionState.createdBy}
        timeRemaining={timeRemaining}
        participants={sessionState.participants}
        onJoin={handleJoin}
        loading={loading}
      />
    )
  }

  return (
    <div className="container mx-auto p-4 pb-8 max-w-6xl">
      <Toaster />
      {showFireworks && <Confetti />}

      <SessionHeader timeRemaining={timeRemaining} isExpiringSoon={isExpiringSoon} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold glitch-text">Sprint Planning Poker</h1>
            <UserInfo currentUser={currentUser} />
          </div>
          {currentUser.isOwner && (
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="main">Votación</TabsTrigger>
              <TabsTrigger value="manage">Gestionar</TabsTrigger>
            </TabsList>
          )}
        </div>

        <TabsContent value="main" className="mt-0">
          {sessionState.userStories.length === 0 ? (
            <NoStoriesMessage isOwner={currentUser.isOwner} onNavigateToManage={() => setActiveTab("manage")} />
          ) : (
            <div className="space-y-6">
              {/* Historia actual */}
              <CurrentStory
                story={activeStory!}
                storyIndex={sessionState.activeStoryIndex}
                totalStories={sessionState.userStories.length}
                isOwner={currentUser.isOwner}
                onPrevious={() => handleChangeStory(sessionState.activeStoryIndex - 1)}
                onNext={() => handleChangeStory(sessionState.activeStoryIndex + 1)}
                loading={loading}
              >
                {!currentUser.isObserver && (
                  <VotingCards currentVote={currentUser.vote} onVote={handleVote} loading={loading} />
                )}
              </CurrentStory>

              {/* Sección unificada de participantes y resultados */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de participantes */}
                <ParticipantsList
                  participants={sessionState.participants}
                  currentUserId={currentUser.id}
                  isOwner={currentUser.isOwner}
                  shouldShowResults={shouldShowResults}
                  onRemoveParticipant={handleRemoveParticipant}
                  loading={loading}
                />

                {/* Resultados */}
                <ResultsPanel
                  participants={sessionState.participants}
                  shouldShowResults={shouldShowResults}
                  hasFullConsensus={!!hasFullConsensus}
                  consensusValue={consensus?.value || null}
                  consensusPercentage={consensus?.percentage || null}
                  average={calculateAverage()}
                  isOwner={currentUser.isOwner}
                  onResetVotes={handleResetVotes}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {currentUser.isOwner && (
          <TabsContent value="manage" className="mt-0">
            <ManageStoriesTab
              userStories={sessionState.userStories}
              activeStoryIndex={sessionState.activeStoryIndex}
              onChangeStory={handleChangeStory}
              onRemoveStory={handleRemoveStory}
              onRemoveAllStories={handleRemoveAllStories}
              onAddStory={handleAddNewStory}
              onResetVotes={handleResetVotes}
              loading={loading}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
