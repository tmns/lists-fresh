import { Handlers } from '$fresh/server.ts'
import { v4 } from 'v4'
import {
  deleteItem,
  getItemById,
  getListById,
  getListsByUserId,
  getUserBySession,
  setItemWithList,
} from 'utils/db.ts'
import { State, Item } from 'utils/types.ts'

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    const body = await req.json()

    if (!body.title || !body.listId) {
      return new Response('Bad request: missing title or list id', { status: 400 })
    }

    const user = await getUserBySession(ctx.state.session ?? '')

    if (!user) {
      return new Response('Not logged in', { status: 401 })
    }

    const list = await getListById(body.listId)

    if (!list || list.userId !== user.id) {
      return new Response('List not found', { status: 404 })
    }

    const item: Item = {
      id: v4.generate(),
      title: body.title,
      listId: list.id,
      isChecked: false,
      createdAt: new Date().toISOString(),
    }

    const success = await setItemWithList(item)

    if (!success) {
      return new Response('Item has been updated/deleted while processing', {
        status: 409,
      })
    }

    return new Response(JSON.stringify(item), { headers: { 'Content-Type': 'application/json' } })
  },

  async PUT(req, ctx) {
    const body = await req.json()

    if (!body.itemId || (!body.title && body.isChecked == null)) {
      return new Response('Bad request: missing itemId, title, or isChecked', { status: 400 })
    }

    const user = await getUserBySession(ctx.state.session ?? '')

    if (!user) {
      return new Response('Not logged in', { status: 401 })
    }

    const [lists, existingItem] = await Promise.all([
      getListsByUserId(user.id),
      getItemById(body.itemId),
    ])

    if (!existingItem || !lists.some((list) => list.id === existingItem.listId)) {
      return new Response('Item not found', { status: 404 })
    }

    const updatedItem: Item = {
      id: body.itemId,
      title: body.title || existingItem.title,
      isChecked: body.isChecked ?? existingItem.isChecked,
      listId: existingItem.listId,
      createdAt: existingItem.createdAt,
    }

    const success = await setItemWithList(updatedItem)

    if (!success) {
      return new Response('List has been updated/deleted while processing', {
        status: 409,
      })
    }

    return new Response(JSON.stringify(updatedItem), {
      headers: { 'Content-Type': 'application/json' },
    })
  },

  async DELETE(req, ctx) {
    const body = await req.json()

    if (!body.id) {
      return new Response('Bad request: missing id', { status: 400 })
    }

    const user = await getUserBySession(ctx.state.session ?? '')

    if (!user) {
      return new Response('Not logged in', { status: 401 })
    }

    const [lists, itemToDelete] = await Promise.all([
      getListsByUserId(user.id),
      getItemById(body.id),
    ])

    if (!itemToDelete || !lists.some((list) => list.id === itemToDelete.listId)) {
      return new Response('Item not found', { status: 404 })
    }

    const success = await deleteItem(itemToDelete)

    if (!success) {
      return new Response('List has been updated/deleted while processing', {
        status: 409,
      })
    }

    return new Response(JSON.stringify(itemToDelete), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
