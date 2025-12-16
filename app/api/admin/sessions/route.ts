import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"
import type { SessionState } from "@/app/actions"

export async function GET() {
  try {
    const sessionIds = (await kv.smembers("active_sessions")) as string[]

    if (!sessionIds || sessionIds.length === 0) {
      return NextResponse.json([])
    }

    const sessions = []

    for (const id of sessionIds) {
      const session = (await kv.get(`session:${id}`)) as SessionState | null

      if (session) {
        // Calculate total points from all participants who voted with numbers
        const totalPoints = session.participants.reduce((sum, participant) => {
          if (typeof participant.vote === "number") {
            return sum + participant.vote
          }
          return sum
        }, 0)

        sessions.push({
          id: session.id,
          name: session.name,
          createdBy: session.createdBy,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          totalPoints,
          participantCount: session.participants.length,
        })
      }
    }

    // Sort by creation date (most recent first)
    return NextResponse.json(sessions.sort((a, b) => b.createdAt - a.createdAt))
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ error: "Error fetching sessions" }, { status: 500 })
  }
}
