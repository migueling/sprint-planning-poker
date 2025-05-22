"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import {
  type Participant,
  type SessionState,
  initializeSessionIfNeeded,
  addParticipant,
  registerVote,
  resetVotes,
  addUserStory,
  changeActiveStory,
  getSessionState,
  updateParticipantActivity,
  removeParticipant,
  removeUserStory,
  removeAllUserStories,
} from "../../actions"
import { formatDistance } from "date-fns"
import { es } from "date-fns/locale"

export function useSession(sessionId: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [currentUser, setCurrentUser] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [showFireworks, setShowFireworks] = useState(false)
  const [lastConsensus, setLastConsensus] = useState<number | null>(null)

  // Actualizar el tiempo actual cada minuto para mostrar correctamente el tiempo restante
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [])

  // Inicializar la sesión y configurar el polling
  useEffect(() => {
    const initialize = async () => {
      try {
        const savedOwnerId = localStorage.getItem("ownerId")
        const state = await initializeSessionIfNeeded(sessionId)

        // Si la sesión ha expirado o no existe, redirigir a la página principal
        if (!state) {
          toast({
            title: "Sesión no disponible",
            description: "La sesión ha expirado o no existe",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Verificar que state tenga la estructura correcta antes de usarlo
        if (!Array.isArray(state.participants)) {
          console.error("Error: state.participants no es un array", state)
          state.participants = []
        }

        if (!Array.isArray(state.userStories)) {
          console.error("Error: state.userStories no es un array", state)
          state.userStories = []
          state.activeStoryIndex = 0
        }

        setSessionState(state)

        // Verificar si el usuario es el propietario
        if (savedOwnerId && state && savedOwnerId === state.ownerId) {
          setIsOwner(true)

          // Si es el propietario, unirse automáticamente como observador
          if (!currentUser) {
            const creatorName = localStorage.getItem("creatorName") || "Product Owner"
            const { participant } = await addParticipant(
              sessionId,
              creatorName,
              true, // isObserver
              savedOwnerId,
              true, // isOwner
            )
            setCurrentUser(participant)
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Error initializing session:", error)
        setLoading(false)

        // Si hay un error, probablemente la sesión no existe o ha expirado
        toast({
          title: "Error",
          description: "No se pudo cargar la sesión. Es posible que haya expirado.",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    initialize()

    // Configurar polling para actualizar el estado
    const intervalId = setInterval(async () => {
      if (!currentUser) return

      try {
        // Actualizar la actividad del usuario actual
        await updateParticipantActivity(sessionId, currentUser.id)

        const state = await getSessionState(sessionId)

        // Si la sesión ha expirado o no existe
        if (!state) {
          toast({
            title: "Sesión expirada",
            description: "La sesión ha expirado o ha sido eliminada",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        // Asegurarse de que state.participants y state.userStories sean arrays
        if (!Array.isArray(state.participants)) {
          console.error("Error: state.participants no es un array", state)
          state.participants = []
        }

        if (!Array.isArray(state.userStories)) {
          console.error("Error: state.userStories no es un array", state)
          state.userStories = []
          state.activeStoryIndex = 0
        }

        setSessionState(state)

        // Actualizar el usuario actual con los datos más recientes
        const updatedCurrentUser = state.participants.find((p) => p.id === currentUser.id)
        if (updatedCurrentUser) {
          setCurrentUser(updatedCurrentUser)
        } else {
          // Si el usuario ya no existe en la sesión (fue eliminado), volver a la pantalla de inicio
          setCurrentUser(null)
        }
      } catch (error) {
        console.error("Error polling session state:", error)
      }
    }, 2000) // Actualizar cada 2 segundos

    // Manejar el evento beforeunload para eliminar al usuario cuando cierra la ventana
    const handleBeforeUnload = async () => {
      if (currentUser) {
        try {
          await removeParticipant(sessionId, currentUser.id)
        } catch (error) {
          console.error("Error removing participant on unload:", error)
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [currentUser, sessionId, router, toast])

  // Efecto para mostrar confeti cuando hay consenso total
  useEffect(() => {
    if (!sessionState) return

    const consensus = getConsensus()

    // Verificar si hay consenso total (100%) y al menos 2 participantes activos
    if (
      consensus &&
      consensus.percentage === 100 &&
      consensus.value !== lastConsensus &&
      sessionState.participants.filter((p) => !p.isObserver && p.vote !== null).length >= 2
    ) {
      // Mostrar confeti
      setShowFireworks(true)
      setLastConsensus(consensus.value)

      // Mostrar un toast celebrando el consenso
      toast({
        title: "¡Consenso total! 🎉",
        description: `Todos han votado ${consensus.value}`,
        duration: 5000,
      })

      // Ocultar el confeti después de 4 segundos
      setTimeout(() => {
        setShowFireworks(false)
      }, 4000)
    }
  }, [sessionState, lastConsensus, toast])

  const handleJoin = async (name: string, isObserver: boolean) => {
    if (!name || !name.trim()) {
      return // No hacer nada si el nombre está vacío
    }

    try {
      setLoading(true)

      // Guardar el nombre del participante en localStorage
      localStorage.setItem("participantName", name)
      localStorage.setItem("isObserver", isObserver.toString())

      const { participant, state } = await addParticipant(sessionId, name, isObserver)
      setCurrentUser(participant)
      setSessionState(state)
    } catch (error) {
      console.error("Error joining session:", error)
      toast({
        title: "Error",
        description: "No se pudo unir a la sesión. Es posible que haya expirado.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (value: number | "NA") => {
    if (!currentUser || !sessionState || currentUser.isObserver || sessionState.userStories.length === 0) return

    try {
      setLoading(true)
      const updatedState = await registerVote(sessionId, currentUser.id, value)

      if (!updatedState) {
        toast({
          title: "Error",
          description: "No se pudo registrar el voto. La sesión puede haber expirado.",
          variant: "destructive",
        })
        return
      }

      setSessionState(updatedState)

      // Actualizar el usuario actual
      const updatedCurrentUser = updatedState.participants.find((p) => p.id === currentUser.id)
      if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser)
      }
    } catch (error) {
      console.error("Error registering vote:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResetVotes = async () => {
    try {
      setLoading(true)
      const updatedState = await resetVotes(sessionId)

      if (!updatedState) {
        toast({
          title: "Error",
          description: "No se pudieron resetear los votos. La sesión puede haber expirado.",
          variant: "destructive",
        })
        return
      }

      setSessionState(updatedState)
      setLastConsensus(null) // Resetear el último consenso

      // Actualizar el usuario actual
      if (currentUser) {
        const updatedCurrentUser = updatedState.participants.find((p) => p.id === currentUser.id)
        if (updatedCurrentUser) {
          setCurrentUser(updatedCurrentUser)
        }
      }
    } catch (error) {
      console.error("Error resetting votes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNewStory = async (title: string) => {
    if (title.trim()) {
      try {
        setLoading(true)
        const updatedState = await addUserStory(sessionId, title)

        if (!updatedState) {
          toast({
            title: "Error",
            description: "No se pudo añadir la historia. La sesión puede haber expirado.",
            variant: "destructive",
          })
          return
        }

        setSessionState(updatedState)
        setLastConsensus(null) // Resetear el último consenso al cambiar de historia
      } catch (error) {
        console.error("Error adding new story:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleChangeStory = async (index: number) => {
    try {
      setLoading(true)
      const updatedState = await changeActiveStory(sessionId, index)

      if (!updatedState) {
        toast({
          title: "Error",
          description: "No se pudo cambiar la historia. La sesión puede haber expirado.",
          variant: "destructive",
        })
        return
      }

      setSessionState(updatedState)
      setLastConsensus(null) // Resetear el último consenso al cambiar de historia
    } catch (error) {
      console.error("Error changing story:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      setLoading(true)
      const updatedState = await removeParticipant(sessionId, participantId)

      if (!updatedState) {
        toast({
          title: "Error",
          description: "No se pudo eliminar al participante. La sesión puede haber expirado.",
          variant: "destructive",
        })
        return
      }

      setSessionState(updatedState)
    } catch (error) {
      console.error("Error removing participant:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStory = async (storyIndex: number) => {
    try {
      setLoading(true)
      const updatedState = await removeUserStory(sessionId, storyIndex)

      if (!updatedState) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la historia. La sesión puede haber expirado.",
          variant: "destructive",
        })
        return
      }

      setSessionState(updatedState)
      setLastConsensus(null) // Resetear el último consenso al eliminar una historia
    } catch (error) {
      console.error("Error removing story:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAllStories = async () => {
    try {
      setLoading(true)
      const updatedState = await removeAllUserStories(sessionId)

      if (!updatedState) {
        toast({
          title: "Error",
          description: "No se pudieron eliminar las historias. La sesión puede haber expirado.",
          variant: "destructive",
        })
        return
      }

      setSessionState(updatedState)
      setLastConsensus(null) // Resetear el último consenso al eliminar todas las historias
    } catch (error) {
      console.error("Error removing all stories:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para formatear el tiempo restante
  const formatTimeRemaining = (expiresAt: number) => {
    if (!expiresAt) return "Desconocido"

    if (expiresAt <= now) {
      return "Expirada"
    }

    return formatDistance(expiresAt, now, {
      locale: es,
      addSuffix: false,
    })
  }

  const calculateAverage = () => {
    if (!sessionState) return 0

    // Filtrar votos numéricos (excluir null y "NA")
    const votes = sessionState.participants.map((p) => p.vote).filter((v): v is number => typeof v === "number")

    if (votes.length === 0) return 0
    return Math.round((votes.reduce((sum, vote) => sum + vote, 0) / votes.length) * 10) / 10
  }

  const getConsensus = () => {
    if (!sessionState) return null

    // Filtrar votos numéricos (excluir null y "NA")
    const votes = sessionState.participants.map((p) => p.vote).filter((v): v is number => typeof v === "number")

    if (votes.length === 0) return null

    const voteCounts: Record<number, number> = {}
    let maxCount = 0
    let consensusValue = votes[0]

    votes.forEach((vote) => {
      voteCounts[vote] = (voteCounts[vote] || 0) + 1
      if (voteCounts[vote] > maxCount) {
        maxCount = voteCounts[vote]
        consensusValue = vote
      }
    })

    const consensusPercentage = Math.round((maxCount / votes.length) * 100)
    return { value: consensusValue, percentage: consensusPercentage }
  }

  // Verificar si todos los participantes no observadores han votado
  const allParticipantsVoted = () => {
    if (!sessionState) return false
    const nonObservers = sessionState.participants.filter((p) => !p.isObserver)
    return nonObservers.length > 0 && nonObservers.every((p) => p.vote !== null)
  }

  // Datos derivados
  const consensus = getConsensus()
  const hasFullConsensus =
    consensus &&
    consensus.percentage === 100 &&
    sessionState?.participants.filter((p) => !p.isObserver && p.vote !== null).length >= 2

  const timeRemaining = sessionState ? formatTimeRemaining(sessionState.expiresAt) : ""
  const isExpiringSoon = sessionState && sessionState.expiresAt && sessionState.expiresAt - now < 3 * 60 * 60 * 1000 // Menos de 3 horas
  const shouldShowResults =
    sessionState && (sessionState.showResults || currentUser?.isObserver || allParticipantsVoted())

  const activeStory =
    sessionState && sessionState.userStories.length > 0 && sessionState.activeStoryIndex >= 0
      ? sessionState.userStories[sessionState.activeStoryIndex]
      : null

  return {
    sessionState,
    currentUser,
    loading,
    isOwner,
    showFireworks, // Mantenemos el mismo nombre para no tener que cambiar todas las referencias
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
  }
}
