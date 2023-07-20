import { HandlerContext } from '$fresh/server.ts'
import Dashboard from 'components/Dashboard.tsx'
import { getListsByUserId, getUserBySession } from 'utils/db.ts'
import { List, State, User } from 'utils/types.ts'

type Data = SignedInData | null

interface SignedInData {
  user: User
  lists: List[]
}

export default async function Lists(req: Request, ctx: HandlerContext<Data, State>) {
  if (!ctx.state.session) {
    return new Response(null, {
      status: 303,
      headers: { location: '/signin' },
    })
  }

  const user = await getUserBySession(ctx.state.session)

  if (!user) {
    return new Response(null, {
      status: 303,
      headers: { location: '/signin' },
    })
  }

  const lists = await getListsByUserId(user.id)

  const sortedLists = lists.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))

  return (
    <Dashboard user={user} lists={sortedLists}>
      <div class="p-4">
        <p>Welcome! Add a new list or select an existing one to see its items!</p>
      </div>
    </Dashboard>
  )
}
