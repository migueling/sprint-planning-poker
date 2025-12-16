import { NextResponse } from "next/server"
import { deleteSession } from "@/app/actions"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const success = await deleteSession(id)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error deleting session:", error)
    return NextResponse.json({ error: "Error deleting session" }, { status: 500 })
  }
}
