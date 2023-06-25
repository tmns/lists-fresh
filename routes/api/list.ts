import { Handlers } from '$fresh/server.ts'
import { v4 } from 'v4'
import { deleteList, getListById, getUserBySession, setListWithUser } from 'utils/db.ts'
import { State, List } from 'utils/types.ts'

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    const body = await req.json()

    if (!body.name) {
      return new Response('Bad request: a list must include a name', { status: 400 })
    }

    const user = await getUserBySession(ctx.state.session ?? '')

    if (!user) {
      return new Response('Not logged in', { status: 401 })
    }

    const list: List = {
      id: v4.generate(),
      name: body.name,
      userId: user.id,
      createdAt: new Date().toISOString(),
    }

    const success = await setListWithUser(list)

    if (!success) {
      return new Response('List has been updated/deleted while processing', {
        status: 409,
      })
    }

    return new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } })
  },

  async PUT(req, ctx) {
    const body = await req.json()

    if (!body.name || !body.listId) {
      return new Response('Bad request: missing name or list id', { status: 400 })
    }

    const user = await getUserBySession(ctx.state.session ?? '')

    if (!user) {
      return new Response('Not logged in', { status: 401 })
    }

    const existingList = await getListById(body.listId)

    if (!existingList) {
      return new Response('List not found', { status: 404 })
    }

    const updatedList: List = {
      id: body.listId,
      name: body.name,
      userId: user.id,
      createdAt: existingList.createdAt,
    }

    const success = await setListWithUser(updatedList)

    if (!success) {
      return new Response('List has been updated/deleted while processing', {
        status: 409,
      })
    }

    return new Response(JSON.stringify(updatedList), {
      headers: { 'Content-Type': 'application/json' },
    })
  },

  async DELETE(req, ctx) {
    const body = await req.json()

    if (!body.id) {
      return new Response('Bad request: missing list id', { status: 400 })
    }

    const user = await getUserBySession(ctx.state.session ?? '')

    if (!user) {
      return new Response('Not logged in', { status: 401 })
    }

    const listToDelete = await getListById(body.id)

    if (!listToDelete) {
      return new Response('List not found', { status: 404 })
    }

    const success = await deleteList(listToDelete)

    if (!success) {
      return new Response('List has been updated/deleted while processing', {
        status: 409,
      })
    }

    return new Response(JSON.stringify(listToDelete), {
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
