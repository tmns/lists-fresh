import { HandlerContext } from '$fresh/server.ts'
import { Items } from 'islands/item/Item.tsx'
import { getItemsByListId, getListById } from 'utils/db.ts'
import { Item, List, State, User } from 'utils/types.ts'

interface SignedInData {
  user: User
  lists: List[]
  items: Item[]
}

type Data = SignedInData | null

export default async function ListsWithItems(_: Request, ctx: HandlerContext<Data, State>) {
  const { id } = ctx.params

  const list = await getListById(id)

  if (!list) {
    return new Response('List does not exist', { status: 404 })
  }

  const items = await getItemsByListId(id)

  const sortedItems = items.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))

  return <Items items={sortedItems} />
}
