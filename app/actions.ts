"use server"

import { kv } from "@vercel/kv"
import { nanoid } from "nanoid"

export type Participant = {
  id: string
  name: string
  vote: number | null | "NA"
  lastActive: number
  isObserver: boolean
  isOwner?: boolean // Nuevo campo para identificar al propietario
}

export type UserStory = {
  id: string
  title: string
}

export type SessionState = {
  id: string
  name: string
  createdBy: string
  ownerId: string // ID del propietario
  createdAt: number
  expiresAt: number // Nueva propiedad para la fecha de expiración
  participants: Participant[]
  userStories: UserStory[]
  activeStoryIndex: number
  showResults: boolean
}

// Constante para la duración de la sesión (12 horas en milisegundos)
const SESSION_DURATION = 12 * 60 * 60 * 1000

// Crear una nueva sesión
export async function createSession(name: string, createdBy: string): Promise<{ sessionId: string; ownerId: string }> {
  try {
    const sessionId = nanoid(10) // ID corto pero único
    const ownerId = `owner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const now = Date.now()

    // Asegurarse de que name y createdBy sean cadenas de texto
    const safeName = typeof name === "string" ? name : String(name || "Sesión de Planning Poker")
    const safeCreatedBy = typeof createdBy === "string" ? createdBy : String(createdBy || "Usuario")

    const newSession: SessionState = {
      id: sessionId,
      name: safeName.trim(),
      createdBy: safeCreatedBy.trim(),
      ownerId: ownerId, // Guardar el ID del creador
      createdAt: now,
      expiresAt: now + SESSION_DURATION, // Establecer la fecha de expiración (12 horas después)
      participants: [
        // Añadir automáticamente al Product Owner como observador
        {
          id: ownerId,
          name: safeCreatedBy.trim(),
          vote: null,
          lastActive: now,
          isObserver: true,
          isOwner: true, // Marcar como propietario
        },
      ],
      userStories: [], // Iniciar con un array vacío de historias
      activeStoryIndex: -1, // No hay historia activa
      showResults: false,
    }

    // Guardar la sesión en Redis con el ID como clave
    await kv.set(`session:${sessionId}`, newSession)

    // Añadir el ID de la sesión a una lista de sesiones activas
    await kv.sadd("active_sessions", sessionId)

    return { sessionId, ownerId }
  } catch (error) {
    console.error("Error creating session:", error)
    throw new Error("No se pudo crear la sesión")
  }
}

// Limpiar sesiones expiradas
export async function cleanExpiredSessions(): Promise<void> {
  try {
    const sessionIds = (await kv.smembers("active_sessions")) as string[]
    const now = Date.now()

    if (!sessionIds || sessionIds.length === 0) {
      return
    }

    const expiredIds = []

    for (const id of sessionIds) {
      const session = (await kv.get(`session:${id}`)) as SessionState | null

      if (session) {
        // Si la sesión ha expirado, añadirla a la lista para eliminar
        if (session.expiresAt && session.expiresAt < now) {
          expiredIds.push(id)
        }
      } else {
        // Si la sesión no existe, también añadirla a la lista para eliminar
        expiredIds.push(id)
      }
    }

    // Eliminar todas las sesiones expiradas en una sola operación
    if (expiredIds.length > 0) {
      for (const id of expiredIds) {
        await kv.del(`session:${id}`)
      }
      await kv.srem("active_sessions", ...expiredIds)
      console.log(`Eliminadas ${expiredIds.length} sesiones expiradas`)
    }
  } catch (error) {
    console.error("Error cleaning expired sessions:", error)
  }
}

// Obtener todas las sesiones activas (no expiradas)
export async function getActiveSessions(): Promise<
  { id: string; name: string; createdBy: string; createdAt: number; expiresAt: number }[]
> {
  try {
    // Primero, limpiar las sesiones expiradas
    await cleanExpiredSessions()

    const sessionIds = (await kv.smembers("active_sessions")) as string[]
    const now = Date.now()

    if (!sessionIds || sessionIds.length === 0) {
      return []
    }

    const sessions = []

    for (const id of sessionIds) {
      const session = (await kv.get(`session:${id}`)) as SessionState | null

      if (session && (!session.expiresAt || session.expiresAt > now)) {
        sessions.push({
          id: session.id,
          name: session.name,
          createdBy: session.createdBy,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt || session.createdAt + SESSION_DURATION,
        })
      }
    }

    // Ordenar por fecha de creación (más reciente primero)
    return sessions.sort((a, b) => b.createdAt - a.createdAt)
  } catch (error) {
    console.error("Error getting active sessions:", error)
    return []
  }
}

// Modificar la función getSessionState
export async function getSessionState(sessionId: string): Promise<SessionState | null> {
  try {
    const state = (await kv.get(`session:${sessionId}`)) as SessionState | null
    const now = Date.now()

    // Si state es null o undefined, o ha expirado, devolver null
    if (!state) {
      return null
    }

    // Verificar si la sesión ha expirado
    if (state.expiresAt && state.expiresAt < now) {
      // Eliminar la sesión expirada
      await kv.del(`session:${sessionId}`)
      await kv.srem("active_sessions", sessionId)
      return null
    }

    // Si la sesión no tiene expiresAt, añadirlo
    if (!state.expiresAt) {
      state.expiresAt = state.createdAt + SESSION_DURATION
    }

    // Asegurarse de que la sesión tenga una estructura válida
    if (!Array.isArray(state.participants)) {
      state.participants = []
    }

    if (!Array.isArray(state.userStories)) {
      state.userStories = []
    }

    // Si activeStoryIndex no es válido, establecerlo a -1 (sin historia activa)
    if (
      state.activeStoryIndex === undefined ||
      state.activeStoryIndex === null ||
      state.activeStoryIndex < -1 ||
      (state.userStories.length > 0 && state.activeStoryIndex >= state.userStories.length)
    ) {
      state.activeStoryIndex = state.userStories.length > 0 ? 0 : -1
    }

    // Migrar historias antiguas que tengan descripción
    if (state.userStories && state.userStories.length > 0) {
      state.userStories = state.userStories.map((story: any) => ({
        id: story.id,
        title: story.title,
      }))
    }

    await kv.set(`session:${sessionId}`, state)
    return state
  } catch (error) {
    console.error("Error getting session state:", error)
    return null
  }
}

// Modificar la función initializeSessionIfNeeded
export async function initializeSessionIfNeeded(sessionId?: string) {
  // Si no hay sessionId, solo devolver null
  if (!sessionId) {
    return null
  }

  try {
    const session = await getSessionState(sessionId)

    // Si la sesión no existe o ha expirado
    if (!session) {
      return null
    }

    // Asegurarse de que la sesión tenga una estructura válida
    if (!Array.isArray(session.participants)) {
      session.participants = []
    }

    if (!Array.isArray(session.userStories)) {
      session.userStories = []
    }

    // Si activeStoryIndex no es válido, establecerlo a -1 (sin historia activa)
    if (
      session.activeStoryIndex === undefined ||
      session.activeStoryIndex === null ||
      session.activeStoryIndex < -1 ||
      (session.userStories.length > 0 && session.activeStoryIndex >= session.userStories.length)
    ) {
      session.activeStoryIndex = session.userStories.length > 0 ? 0 : -1
    }

    // Limpiar participantes inactivos
    await cleanInactiveParticipants(sessionId)

    return session
  } catch (error) {
    console.error("Error initializing session:", error)
    return null
  }
}

// Añadir un nuevo participante
export async function addParticipant(
  sessionId: string,
  name: string,
  isObserver = false,
  participantId?: string,
  isOwner = false,
): Promise<{ participant: Participant; state: SessionState }> {
  const state = await getSessionState(sessionId)

  if (!state) {
    throw new Error("La sesión no existe o ha expirado")
  }

  // Asegurarse de que name sea una cadena de texto
  const safeName = typeof name === "string" ? name : String(name || "Usuario")

  const newParticipant: Participant = {
    id: participantId || `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name: safeName.trim(),
    vote: null,
    lastActive: Date.now(),
    isObserver,
    isOwner,
  }

  // Verificar si el participante ya existe (por ID)
  const existingIndex = state.participants.findIndex((p) => p.id === newParticipant.id)
  if (existingIndex >= 0) {
    // Actualizar el participante existente
    state.participants[existingIndex] = {
      ...state.participants[existingIndex],
      name: newParticipant.name,
      lastActive: newParticipant.lastActive,
      isObserver: newParticipant.isObserver,
      isOwner: newParticipant.isOwner,
    }
  } else {
    // Añadir nuevo participante
    state.participants.push(newParticipant)
  }

  await kv.set(`session:${sessionId}`, state)

  return {
    participant: existingIndex >= 0 ? state.participants[existingIndex] : newParticipant,
    state,
  }
}

// Actualizar el timestamp de actividad de un participante
export async function updateParticipantActivity(sessionId: string, participantId: string): Promise<void> {
  const state = await getSessionState(sessionId)

  if (!state) {
    return
  }

  state.participants = state.participants.map((p) => (p.id === participantId ? { ...p, lastActive: Date.now() } : p))

  await kv.set(`session:${sessionId}`, state)
}

// Eliminar un participante
export async function removeParticipant(sessionId: string, participantId: string): Promise<SessionState | null> {
  const state = await getSessionState(sessionId)

  if (!state) {
    return null
  }

  // Filtrar el participante a eliminar
  state.participants = state.participants.filter((p) => p.id !== participantId)

  // Verificar si todos los participantes restantes han votado (excluyendo observadores y votos NA)
  const activeParticipants = state.participants.filter((p) => !p.isObserver)
  const allVoted = activeParticipants.length > 0 && activeParticipants.every((p) => p.vote !== null)

  state.showResults = allVoted

  await kv.set(`session:${sessionId}`, state)
  return state
}

// Limpiar participantes inactivos (más de 5 minutos sin actividad)
export async function cleanInactiveParticipants(sessionId: string): Promise<void> {
  const state = await getSessionState(sessionId)

  if (!state) {
    return
  }

  const now = Date.now()
  const inactivityThreshold = 5 * 60 * 1000 // 5 minutos en milisegundos

  // Filtrar participantes inactivos (excepto el propietario)
  state.participants = state.participants.filter((p) => {
    return p.isOwner || now - p.lastActive < inactivityThreshold
  })

  // Verificar si todos los participantes restantes han votado (excluyendo observadores y votos NA)
  const activeParticipants = state.participants.filter((p) => !p.isObserver)
  const allVoted = activeParticipants.length > 0 && activeParticipants.every((p) => p.vote !== null)

  state.showResults = allVoted

  await kv.set(`session:${sessionId}`, state)
}

// Registrar un voto (ahora acepta "NA" como valor)
export async function registerVote(
  sessionId: string,
  participantId: string,
  vote: number | "NA",
): Promise<SessionState | null> {
  const state = await getSessionState(sessionId)

  if (!state) {
    return null
  }

  state.participants = state.participants.map((p) =>
    p.id === participantId ? { ...p, vote, lastActive: Date.now() } : p,
  )

  // Verificar si todos los participantes activos (no observadores) han votado
  const activeParticipants = state.participants.filter((p) => !p.isObserver)
  const allVoted = activeParticipants.length > 0 && activeParticipants.every((p) => p.vote !== null)

  state.showResults = allVoted

  await kv.set(`session:${sessionId}`, state)
  return state
}

// Resetear los votos
export async function resetVotes(sessionId: string): Promise<SessionState | null> {
  const state = await getSessionState(sessionId)

  if (!state) {
    return null
  }

  state.participants = state.participants.map((p) => ({ ...p, vote: null, lastActive: Date.now() }))
  state.showResults = false

  await kv.set(`session:${sessionId}`, state)
  return state
}

// Añadir una nueva historia
export async function addUserStory(sessionId: string, title: string): Promise<SessionState | null> {
  const state = await getSessionState(sessionId)

  if (!state) {
    return null
  }

  const newStory: UserStory = {
    id: `story-${Date.now()}`,
    title: title.trim(),
  }

  // Asegurarse de que userStories sea un array
  if (!Array.isArray(state.userStories)) {
    state.userStories = []
  }

  state.userStories.push(newStory)

  // Si es la primera historia, establecer activeStoryIndex a 0
  // Si ya hay historias, establecer activeStoryIndex a la nueva historia
  state.activeStoryIndex = state.userStories.length - 1

  // Resetear votos al cambiar de historia
  state.participants = state.participants.map((p) => ({ ...p, vote: null, lastActive: Date.now() }))
  state.showResults = false

  await kv.set(`session:${sessionId}`, state)
  return state
}

// Actualizar una historia existente
export async function updateUserStory(
  sessionId: string,
  storyIndex: number,
  newTitle: string,
): Promise<SessionState | null> {
  const state = await getSessionState(sessionId)

  if (!state) {
    return null
  }

  // Verificar que el índice sea válido
  if (storyIndex < 0 || storyIndex >= state.userStories.length) {
    return null
  }

  // Verificar que hay participantes que han votado en esta historia
  const hasVotes = state.participants.some((p) => p.vote !== null && !p.isObserver)

  // Si hay votos, no permitir editar
  if (hasVotes && state.activeStoryIndex === storyIndex) {
    return null
  }

  // Actualizar el título de la historia
  state.userStories[storyIndex].title = newTitle.trim()

  await kv.set(`session:${sessionId}`, state)
  return state
}

// Eliminar una historia de usuario
export async function removeUserStory(sessionId: string, storyIndex: number): Promise<SessionState | null> {
  try {
    const state = await getSessionState(sessionId)

    if (!state) {
      return null
    }

    // Verificar que userStories sea un array
    if (!Array.isArray(state.userStories)) {
      state.userStories = [
        {
          id: `story-${Date.now()}`,
          title: "Historia por defecto",
        },
      ]
      state.activeStoryIndex = 0
      await kv.set(`session:${sessionId}`, state)
      return state
    }

    // Verificar que el índice sea válido y que no sea la única historia
    if (storyIndex < 0 || storyIndex >= state.userStories.length || state.userStories.length <= 1) {
      return state // No eliminar si es la única historia o el índice es inválido
    }

    // Eliminar la historia
    state.userStories.splice(storyIndex, 1)

    // Ajustar el índice activo si es necesario
    if (state.activeStoryIndex >= state.userStories.length) {
      state.activeStoryIndex = state.userStories.length - 1
    }

    // Resetear votos
    if (Array.isArray(state.participants)) {
      state.participants = state.participants.map((p) => ({ ...p, vote: null, lastActive: Date.now() }))
    } else {
      state.participants = []
    }

    state.showResults = false

    await kv.set(`session:${sessionId}`, state)
    return state
  } catch (error) {
    console.error("Error removing user story:", error)
    return null
  }
}

// Eliminar todas las historias excepto una
export async function removeAllUserStories(sessionId: string): Promise<SessionState | null> {
  try {
    const state = await getSessionState(sessionId)

    if (!state) {
      return null
    }

    // Mantener solo la primera historia o crear una nueva si no hay historias
    if (state.userStories.length > 0) {
      const firstStory = state.userStories[0]
      state.userStories = [firstStory]
    } else {
      state.userStories = [
        {
          id: `story-${Date.now()}`,
          title: "Historia por defecto",
        },
      ]
    }

    state.activeStoryIndex = 0

    // Resetear votos
    if (Array.isArray(state.participants)) {
      state.participants = state.participants.map((p) => ({ ...p, vote: null, lastActive: Date.now() }))
    } else {
      state.participants = []
    }

    state.showResults = false

    await kv.set(`session:${sessionId}`, state)
    return state
  } catch (error) {
    console.error("Error removing all user stories:", error)
    return null
  }
}

// Cambiar la historia activa
export async function changeActiveStory(sessionId: string, index: number): Promise<SessionState | null> {
  const state = await getSessionState(sessionId)

  if (!state) {
    return null
  }

  if (index >= 0 && index < state.userStories.length) {
    state.activeStoryIndex = index

    // Resetear votos al cambiar de historia
    state.participants = state.participants.map((p) => ({ ...p, vote: null, lastActive: Date.now() }))
    state.showResults = false

    await kv.set(`session:${sessionId}`, state)
  }

  return state
}

// Eliminar una sesión
export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    await kv.del(`session:${sessionId}`)
    await kv.srem("active_sessions", sessionId)
    return true
  } catch (error) {
    console.error("Error deleting session:", error)
    return false
  }
}
