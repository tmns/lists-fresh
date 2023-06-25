import { Handlers } from '$fresh/server.ts'
import { deleteCookie, getCookies, setCookie } from '$std/http/cookie.ts'
import { getAndDeleteOauthSession, setUserWithSession } from 'utils/db.ts'
import {
  Provider,
  getAuthenticatedUser,
  initOauth2Client,
  providers,
} from 'utils/oauth.ts'
import { User } from 'utils/types.ts'

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers)
    const oauthSessionCookie = cookies['oauth-session']

    if (!oauthSessionCookie) {
      return new Response('Missing oauth session', {
        status: 400,
      })
    }

    const oauthSession = await getAndDeleteOauthSession(oauthSessionCookie)
    if (!oauthSession) {
      return new Response('Missing oauth session', {
        status: 400,
      })
    }

    const { provider } = ctx.params
    if (!providers.some((p) => p === provider)) {
      return new Response('Provider not found', {
        status: 404,
      })
    }

    const { state, codeVerifier } = oauthSession
    const oauth2Client = initOauth2Client(provider as Provider)

    const tokens = await oauth2Client!.code.getToken(req.url, {
      state,
      codeVerifier,
    })

    const userObject = await getAuthenticatedUser(tokens.accessToken, provider)

    const isGoogle = provider === 'google'
    const id = isGoogle ? String(userObject.sub) : String(userObject.id)
    const name = isGoogle ? userObject.name : userObject.username
    const image = isGoogle
      ? userObject.picture
      : `https://cdn.discordapp.com/avatars/${userObject.id}/${userObject.avatar}.png`
    const email = userObject.email
    const user: User = { id, email, name, image }

    const session = crypto.randomUUID()
    await setUserWithSession(user, session)

    const resp = new Response('Logged in', {
      headers: {
        Location: '/lists',
      },
      status: 307,
    })

    deleteCookie(resp.headers, 'oauth-session')

    setCookie(resp.headers, {
      name: 'session',
      value: session,
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
    })

    return resp
  },
}
