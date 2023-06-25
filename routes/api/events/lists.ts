// General approach taken from https://github.com/denoland/tic-tac-toe

import { Handlers } from '$fresh/server.ts'
import { State } from 'utils/types.ts'
import { getUserBySession, subscribeListsByUser } from 'utils/db.ts'

export const handler: Handlers<undefined, State> = {
  async GET(_, ctx) {
    if (!ctx.state.session) {
      return new Response('Not logged in', { status: 401 })
    }

    const user = await getUserBySession(ctx.state.session)
    if (!user) return new Response('Not logged in', { status: 401 })

    let cleanup: () => void

    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(`retry: 1000\n\n`)
        cleanup = subscribeListsByUser(user.id, (lists) => {
          const data = JSON.stringify(lists)
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
