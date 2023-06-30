import { HandlerContext } from '$fresh/server.ts'
import { User, State } from 'utils/types.ts'

import OAuthOptions from '../../islands/OAuthOptions.tsx'
import { getUserBySession } from '../../utils/db.ts'

type Data = SignedInData | null

interface SignedInData {
  user: User
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  if (ctx.state.session) {
    const user = await getUserBySession(ctx.state.session)

    if (user) {
      return new Response(null, {
        status: 303,
        headers: { location: '/lists' },
      })
    }
  }

  return ctx.render()
}

export default function Signin() {
  return (
    <main class="flex flex-col items-center justify-center gap-12 px-4 py-16">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-sky-100">
          Sign in to your account
        </h2>
      </div>
      <div class="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div class="rounded-lg bg-white px-6 py-12 shadow sm:px-12">
          <div class="relative">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-gray-200" />
            </div>
            <div class="relative flex justify-center text-sm font-medium leading-6">
              <span class="bg-white px-6 text-gray-900">You can use the following to sign in</span>
            </div>
          </div>
          <OAuthOptions />
        </div>
      </div>
    </main>
  )
}
