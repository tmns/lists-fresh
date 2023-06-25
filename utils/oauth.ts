// General approach taken from https://github.com/denoland/tic-tac-toe

import '$std/dotenv/load.ts'
import { OAuth2Client } from 'oAuth2'

export type Provider = 'google' | 'discord'
export const providers: ['google', 'discord'] = ['google', 'discord']

export const initOauth2Client = (provider: Provider) => {
  if (provider === 'google') {
    return new OAuth2Client({
      clientId: Deno.env.get('GOOGLE_CLIENT_ID')!,
      clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
      authorizationEndpointUri: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUri: 'https://www.googleapis.com/oauth2/v4/token',
      defaults: {
        scope: ['profile', 'email'],
      },
      redirectUri: Deno.env.get('GOOGLE_REDIRECT_URI'),
    })
  }

  if (provider === 'discord') {
    return new OAuth2Client({
      clientId: Deno.env.get('DISCORD_CLIENT_ID')!,
      clientSecret: Deno.env.get('DISCORD_CLIENT_SECRET')!,
      authorizationEndpointUri: 'https://discord.com/oauth2/authorize',
      tokenUri: 'https://discord.com/api/oauth2/token',
      defaults: {
        scope: ['identify', 'email'],
      },
      redirectUri: Deno.env.get('DISCORD_REDIRECT_URI'),
    })
  }
}

const endpoints: { [key: string]: string } = {
  google: 'https://www.googleapis.com/oauth2/v3/userinfo',
  discord: 'https://discord.com/api/users/@me',
}

export async function getAuthenticatedUser(token: string, provider: string) {
  const endpoint = endpoints[provider]
  if (!endpoint) throw new Error('Invalid provider')

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) throw new Error('Failed to fetch user')

  return await res.json()
}
