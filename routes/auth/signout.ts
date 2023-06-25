import { Handlers } from '$fresh/server.ts'
import { deleteCookie } from '$std/http/cookie.ts'
import { deleteSession } from 'utils/db.ts'
import { State } from 'utils/types.ts'

export const handler: Handlers<undefined, State> = {
  async GET(_, ctx) {
    if (ctx.state.session) await deleteSession(ctx.state.session)
    const resp = new Response('Logged out', {
      headers: {
        Location: '/',
      },
      status: 307,
    })
    deleteCookie(resp.headers, 'session')
    return resp
  },
}
