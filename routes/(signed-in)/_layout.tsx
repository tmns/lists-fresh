import { LayoutContext, RouteConfig } from '$fresh/server.ts'
import Dashboard from 'components/Dashboard.tsx'
import { getUserBySession, getListsByUserId } from 'utils/db.ts'
import { Item, List, State, User } from 'utils/types.ts'

interface SignedInData {
  user: User
  lists: List[]
  items: Item[]
}

type Data = SignedInData | null

export default async function Layout(_: Request, ctx: LayoutContext<Data, State>) {
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
      <ctx.Component />
    </Dashboard>
  )
}

export const config: RouteConfig = {
  skipInheritedLayouts: true,
}
