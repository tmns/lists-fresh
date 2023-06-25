import { HandlerContext, PageProps } from '$fresh/server.ts'
import Dashboard from 'components/Dashboard.tsx'
import Items from 'islands/item/Items.tsx'
import { getItemsByListId, getListById, getListsByUserId, getUserBySession } from 'utils/db.ts'
import { Item, List, State, User } from 'utils/types.ts'

type Data = SignedInData | null

interface SignedInData {
  user: User
  lists: List[]
  items: Item[]
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
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

  return ctx.render({ user, lists: sortedLists, items: sortedItems })
}

export default function ListsWithItems(props: PageProps<Data>) {
  return (
    <Dashboard user={props.data!.user} lists={props.data!.lists}>
      <Items items={props.data!.items} />
    </Dashboard>
  )
}
