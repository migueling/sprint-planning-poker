import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock @vercel/kv before importing actions
const mockKv = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  sadd: vi.fn(),
  srem: vi.fn(),
  smembers: vi.fn(),
}

vi.mock("@vercel/kv", () => ({
  kv: mockKv,
}))

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "test-id-123"),
}))

// Import after mocks
import {
  createSession,
  getSessionState,
  addParticipant,
  registerVote,
  resetVotes,
  addUserStory,
  updateUserStory,
  removeUserStory,
  removeAllUserStories,
  changeActiveStory,
  deleteSession,
  removeParticipant,
  type SessionState,
  type Participant,
} from "@/app/actions"

const createMockSession = (overrides?: Partial<SessionState>): SessionState => ({
  id: "test-session",
  name: "Test Session",
  createdBy: "Test Owner",
  ownerId: "owner-123",
  createdAt: Date.now(),
  expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  participants: [
    {
      id: "owner-123",
      name: "Test Owner",
      vote: null,
      lastActive: Date.now(),
      isObserver: true,
      isOwner: true,
    },
    {
      id: "user-1",
      name: "Dev 1",
      vote: null,
      lastActive: Date.now(),
      isObserver: false,
      isOwner: false,
    },
    {
      id: "user-2",
      name: "Dev 2",
      vote: null,
      lastActive: Date.now(),
      isObserver: false,
      isOwner: false,
    },
  ],
  userStories: [
    { id: "story-1", title: "Story 1" },
    { id: "story-2", title: "Story 2" },
  ],
  activeStoryIndex: 0,
  showResults: false,
  ...overrides,
})

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a new session and return sessionId and ownerId", async () => {
    mockKv.set.mockResolvedValue("OK")
    mockKv.sadd.mockResolvedValue(1)

    const result = await createSession("My Session", "Mike")

    expect(result.sessionId).toBe("test-id-123")
    expect(result.ownerId).toBeDefined()
    expect(mockKv.set).toHaveBeenCalledTimes(1)
    expect(mockKv.sadd).toHaveBeenCalledWith("active_sessions", "test-id-123")
  })

  it("should handle non-string name gracefully", async () => {
    mockKv.set.mockResolvedValue("OK")
    mockKv.sadd.mockResolvedValue(1)

    const result = await createSession(123 as any, null as any)

    expect(result.sessionId).toBeDefined()
  })

  it("should set session to expire in 12 hours", async () => {
    mockKv.set.mockResolvedValue("OK")
    mockKv.sadd.mockResolvedValue(1)

    const before = Date.now()
    await createSession("Session", "Owner")
    const after = Date.now()

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    const twelveHours = 12 * 60 * 60 * 1000

    expect(savedSession.expiresAt).toBeGreaterThanOrEqual(before + twelveHours)
    expect(savedSession.expiresAt).toBeLessThanOrEqual(after + twelveHours)
  })

  it("should add the creator as an observer and owner", async () => {
    mockKv.set.mockResolvedValue("OK")
    mockKv.sadd.mockResolvedValue(1)

    await createSession("Session", "Mike")

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    const owner = savedSession.participants[0]

    expect(owner.isObserver).toBe(true)
    expect(owner.isOwner).toBe(true)
    expect(owner.name).toBe("Mike")
  })

  it("should start with empty user stories", async () => {
    mockKv.set.mockResolvedValue("OK")
    mockKv.sadd.mockResolvedValue(1)

    await createSession("Session", "Mike")

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    expect(savedSession.userStories).toEqual([])
    expect(savedSession.activeStoryIndex).toBe(-1)
  })
})

describe("getSessionState", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return the session state", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)

    const result = await getSessionState("test-session")

    expect(result).toBeDefined()
    expect(result?.id).toBe("test-session")
  })

  it("should return null for non-existent session", async () => {
    mockKv.get.mockResolvedValue(null)

    const result = await getSessionState("non-existent")

    expect(result).toBeNull()
  })

  it("should return null and delete an expired session", async () => {
    const expiredSession = createMockSession({
      expiresAt: Date.now() - 1000, // expired 1 second ago
    })
    mockKv.get.mockResolvedValue(expiredSession)

    const result = await getSessionState("test-session")

    expect(result).toBeNull()
    expect(mockKv.del).toHaveBeenCalledWith("session:test-session")
    expect(mockKv.srem).toHaveBeenCalledWith("active_sessions", "test-session")
  })

  it("should fix invalid activeStoryIndex", async () => {
    const mockSession = createMockSession({ activeStoryIndex: 99 })
    mockKv.get.mockResolvedValue(mockSession)

    const result = await getSessionState("test-session")

    expect(result?.activeStoryIndex).toBe(0)
  })

  it("should initialize missing arrays", async () => {
    const brokenSession = {
      ...createMockSession(),
      participants: null,
      userStories: null,
    }
    mockKv.get.mockResolvedValue(brokenSession)

    const result = await getSessionState("test-session")

    expect(Array.isArray(result?.participants)).toBe(true)
    expect(Array.isArray(result?.userStories)).toBe(true)
  })
})

describe("addParticipant", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should add a new participant to the session", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    const result = await addParticipant("test-session", "New Dev")

    expect(result.participant.name).toBe("New Dev")
    expect(result.participant.isObserver).toBe(false)
  })

  it("should add an observer participant", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    const result = await addParticipant("test-session", "Observer", true)

    expect(result.participant.isObserver).toBe(true)
  })

  it("should update an existing participant if ID matches", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    const result = await addParticipant("test-session", "Updated Name", false, "user-1")

    expect(result.participant.name).toBe("Updated Name")
    expect(result.participant.id).toBe("user-1")
  })

  it("should throw if the session does not exist", async () => {
    mockKv.get.mockResolvedValue(null)

    await expect(addParticipant("non-existent", "Dev")).rejects.toThrow()
  })
})

describe("registerVote", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should register a vote for a participant", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    const result = await registerVote("test-session", "user-1", 5)

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    const voter = savedSession.participants.find((p) => p.id === "user-1")

    expect(voter?.vote).toBe(5)
  })

  it("should set showResults to true when all active participants have voted", async () => {
    const mockSession = createMockSession()
    mockSession.participants[1].vote = 5 // user-1 voted
    mockSession.participants[2].vote = 8 // user-2 voted
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    // Vote for the remaining participant (but both already voted, so just re-registering)
    await registerVote("test-session", "user-2", 8)

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    expect(savedSession.showResults).toBe(true)
  })

  it("should return null for a non-existent session", async () => {
    mockKv.get.mockResolvedValue(null)

    const result = await registerVote("non-existent", "user-1", 5)

    expect(result).toBeNull()
  })
})

describe("resetVotes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should reset all votes to null", async () => {
    const mockSession = createMockSession()
    mockSession.participants[1].vote = 5
    mockSession.participants[2].vote = 8
    mockSession.showResults = true
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await resetVotes("test-session")

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    savedSession.participants.forEach((p) => {
      expect(p.vote).toBeNull()
    })
    expect(savedSession.showResults).toBe(false)
  })
})

describe("addUserStory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should add a new user story", async () => {
    const mockSession = createMockSession({ userStories: [], activeStoryIndex: -1 })
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await addUserStory("test-session", "New Story")

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    expect(savedSession.userStories).toHaveLength(1)
    expect(savedSession.userStories[0].title).toBe("New Story")
    expect(savedSession.activeStoryIndex).toBe(0)
  })

  it("should reset votes when adding a new story", async () => {
    const mockSession = createMockSession()
    mockSession.participants[1].vote = 5
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await addUserStory("test-session", "Another Story")

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    savedSession.participants.forEach((p) => {
      expect(p.vote).toBeNull()
    })
  })
})

describe("updateUserStory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should update the title of a story", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await updateUserStory("test-session", 0, "Updated Title")

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    expect(savedSession.userStories[0].title).toBe("Updated Title")
  })

  it("should return null for invalid index", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)

    const result = await updateUserStory("test-session", 99, "Nope")

    expect(result).toBeNull()
  })

  it("should not update if there are active votes on the story", async () => {
    const mockSession = createMockSession()
    mockSession.participants[1].vote = 5
    mockKv.get.mockResolvedValue(mockSession)

    const result = await updateUserStory("test-session", 0, "Should Not Update")

    expect(result).toBeNull()
  })
})

describe("removeUserStory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should remove a story by index", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await removeUserStory("test-session", 1)

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    expect(savedSession.userStories).toHaveLength(1)
    expect(savedSession.userStories[0].title).toBe("Story 1")
  })

  it("should not remove the last story", async () => {
    const mockSession = createMockSession({
      userStories: [{ id: "story-1", title: "Only Story" }],
    })
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    const result = await removeUserStory("test-session", 0)

    expect(result?.userStories).toHaveLength(1)
  })
})

describe("removeAllUserStories", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should keep only the first story", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await removeAllUserStories("test-session")

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    expect(savedSession.userStories).toHaveLength(1)
    expect(savedSession.activeStoryIndex).toBe(0)
  })
})

describe("changeActiveStory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should change the active story index", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await changeActiveStory("test-session", 1)

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    expect(savedSession.activeStoryIndex).toBe(1)
  })

  it("should reset votes when changing story", async () => {
    const mockSession = createMockSession()
    mockSession.participants[1].vote = 5
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await changeActiveStory("test-session", 1)

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    savedSession.participants.forEach((p) => {
      expect(p.vote).toBeNull()
    })
  })

  it("should not change to an invalid index", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await changeActiveStory("test-session", 99)

    expect(mockKv.set).not.toHaveBeenCalled()
  })
})

describe("removeParticipant", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should remove a participant by id", async () => {
    const mockSession = createMockSession()
    mockKv.get.mockResolvedValue(mockSession)
    mockKv.set.mockResolvedValue("OK")

    await removeParticipant("test-session", "user-1")

    const savedSession = mockKv.set.mock.calls[0][1] as SessionState
    expect(savedSession.participants.find((p) => p.id === "user-1")).toBeUndefined()
  })
})

describe("deleteSession", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should delete a session from Redis", async () => {
    mockKv.del.mockResolvedValue(1)
    mockKv.srem.mockResolvedValue(1)

    const result = await deleteSession("test-session")

    expect(result).toBe(true)
    expect(mockKv.del).toHaveBeenCalledWith("session:test-session")
    expect(mockKv.srem).toHaveBeenCalledWith("active_sessions", "test-session")
  })

  it("should return false on error", async () => {
    mockKv.del.mockRejectedValue(new Error("Redis error"))

    const result = await deleteSession("test-session")

    expect(result).toBe(false)
  })
})
