import { Handlers } from '$fresh/server.ts'
import { getNoteById, getUserBySession, setNoteWithUser } from 'utils/db.ts'
import { State, Note } from 'utils/types.ts'

export const handler: Handlers<undefined, State> = {
  async PUT(req, ctx) {
    const body = await req.json()

    if (body.content == null) {
      return new Response('Bad request: missing content', { status: 400 })
    }

    const user = await getUserBySession(ctx.state.session ?? '')

    if (!user) {
      return new Response('Not logged in', { status: 401 })
    }

    const existingNote = await getNoteById(body.id)

    if (!existingNote) {
      return new Response('Note not found', { status: 404 })
    }

    const updatedNote: Note = {
      id: body.id,
      content: JSON.stringify(body.content),
      userId: user.id,
      instanceId: body.instanceId,
      createdAt: existingNote.createdAt,
    }

    const success = await setNoteWithUser(updatedNote)

    if (!success) {
      return new Response('List has been updated/deleted while processing', {
        status: 409,
      })
    }

    return new Response(JSON.stringify(updatedNote), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
