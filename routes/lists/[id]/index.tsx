import { HandlerContext } from '$fresh/server.ts'
import Dashboard from 'components/Dashboard.tsx'
import { Items } from 'islands/item/Item.tsx'
import { getItemsByListId, getListById, getListsByUserId, getUserBySession } from 'utils/db.ts'
import { Item, List, State, User } from 'utils/types.ts'

type Data = SignedInData | null

interface SignedInData {
  user: User
  lists: List[]
  items: Item[]
}

export default async function ListsWithItems(req: Request, ctx: HandlerContext<Data, State>) {
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

  const { id } = ctx.params

  const list = await getListById(id)

  if (!list) {
    return new Response('List does not exist', { status: 404 })
  }

  const [lists, items] = await Promise.all([getListsByUserId(user.id), getItemsByListId(id)])

  const sortedLists = lists.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))
  const sortedItems = items.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))

  return (
    <Dashboard user={user} lists={sortedLists}>
      <Items items={sortedItems} />
    </Dashboard>
  )
}
