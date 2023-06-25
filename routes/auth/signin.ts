import { Handlers } from '$fresh/server.ts'
import { setCookie } from '$std/http/cookie.ts'
import { setOauthSession } from 'utils/db.ts'
import { Provider, initOauth2Client, providers } from 'utils/oauth.ts'

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url)
    const provider = url.searchParams.get('provider')

    if (!provider || !providers.some((p) => p === provider)) {
      return new Response('Provider not found', {
        status: 404,
      })
    }

    const oauthSession = crypto.randomUUID()
    const state = crypto.randomUUID()
    const oauth2Client = initOauth2Client(provider as Provider)

    if (oauth2Client === undefined) {
      return new Response('Provider not found', {
        status: 404,
      })
    }

    const { uri, codeVerifier } = await oauth2Client.code.getAuthorizationUri({ state })

    setOauthSession(oauthSession, { state, codeVerifier })
    const resp = new Response('Redirecting...', {
      headers: {
        Location: uri.href,
      },
      status: 307,
    })
    setCookie(resp.headers, {
      name: 'oauth-session',
      value: oauthSession,
      path: '/',
      httpOnly: true,
    })
    return resp
  },
}
