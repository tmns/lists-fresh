// General approach taken from https://github.com/denoland/tic-tac-toe

import { Handlers } from '$fresh/server.ts'
import { State } from 'utils/types.ts'
import { getListById, getUserBySession, subscribeItemsByList } from 'utils/db.ts'

export const handler: Handlers<undefined, State> = {
  async GET(req, ctx) {
    if (!ctx.state.session) {
      return new Response('Not logged in', { status: 401 })
    }

    const user = await getUserBySession(ctx.state.session)
    if (!user) return new Response('Not logged in', { status: 401 })

    const url = new URL(req.url)
    const listId = url.searchParams.get('listId')

    if (!listId) {
      return new Response('Bad request: Missing listId', { status: 400 })
    }

    const list = await getListById(listId)
    if (!list || list.userId !== user.id) {
      return new Response('List not found', { status: 404 })
    }

    let cleanup: () => void

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(`retry: 1000\n\n`)
        cleanup = subscribeItemsByList(list.id, (items) => {
          const data = JSON.stringify(items)
          controller.enqueue(`data: ${data}\n\n`)
        })
      },
      cancel() {
        cleanup()
      },
    })

    return new Response(body.pipeThrough(new TextEncoderStream()), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  },
}
