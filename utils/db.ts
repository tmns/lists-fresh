// General approach taken from https://github.com/denoland/tic-tac-toe

import { Item, List, OauthSession, User, Note } from './types.ts'

const kv = await Deno.openKv()

//////////////////////////////////////////////////////////////////
// Sessions / Users
//////////////////////////////////////////////////////////////////

export async function getAndDeleteOauthSession(session: string): Promise<OauthSession | null> {
  const res = await kv.get<OauthSession>(['oauth_sessions', session])
  if (res.versionstamp === null) return null

  await kv.delete(['oauth_seessions', session])
  return res.value
}

export async function setOauthSession(session: string, value: OauthSession) {
  await kv.set(['oauth_sessions', session], value)
}

export async function setUserWithSession(user: User, session: string) {
  await kv.atomic().set(['users', user.id], user).set(['users_by_session', session], user).commit()
}

export async function getUserBySession(session: string) {
  const res = await kv.get<User>(['users_by_session', session])
  return res.value
}

export async function getUserById(id: string) {
  const res = await kv.get<User>(['users', id])
  return res.value
}

export async function deleteSession(session: string) {
  await kv.delete(['users_by_session', session])
}

//////////////////////////////////////////////////////////////////
// Lists
//////////////////////////////////////////////////////////////////

export async function setListWithUser(list: List) {
  const ao = kv.atomic()

  const res = await ao
    .set(['lists', list.id], list)
    .set(['lists_by_userId', list.userId, list.id], list)
    .commit()

  if (res.ok) {
    console.log('broadcasting list update', list.id, res.versionstamp)
    const bc = new BroadcastChannel(`lists_by_userId/${list.userId}`)
    const lists = await getListsByUserId(list.userId)
    bc.postMessage({ lists, versionstamp: res!.versionstamp })
    setTimeout(() => bc.close(), 5)
  }

  return res.ok
}

export async function deleteList(list: List) {
  const ao = kv.atomic()

  const res = await ao
    .delete(['lists', list.id])
    .delete(['lists_by_userId', list.userId, list.id])
    .commit()

  if (res.ok) {
    console.log('broadcasting list delete', list.id, res.versionstamp)
    const bc = new BroadcastChannel(`lists_by_userId/${list.userId}`)
    const lists = await getListsByUserId(list.userId)
    bc.postMessage({ lists, versionstamp: res!.versionstamp })
    setTimeout(() => bc.close(), 5)
  }

  return res.ok
}

export async function getListById(id: string): Promise<List> {
  const res = await kv.get<List>(['lists', id])
  return res.value
}

export async function getListsByUserId(userId: string): Promise<List[]> {
  const iter = kv.list<List>({ prefix: ['lists_by_userId', userId] })

  const lists = []
  for await (const { value } of iter) {
    lists.push(value)
  }
  return lists
}

export function subscribeListsByUser(userId: string, cb: (lists: List[]) => void) {
  const bc = new BroadcastChannel(`lists_by_userId/${userId}`)
  let closed = false
  getListsByUserId(userId).then((lists) => {
    if (closed) return
    cb(lists)
    const lastVersionstamps = new Map<List[], string>()
    bc.onmessage = (e) => {
      const { lists, versionstamp } = e.data
      console.log(
        'received lists_by_userId update',
        lists,
        versionstamp,
        `(last: ${lastVersionstamps.get(lists)})`,
      )
      if ((lastVersionstamps.get(lists) ?? '') >= versionstamp) return
      lastVersionstamps.set(lists, versionstamp)
      cb(lists)
    }
  })
  return () => {
    closed = true
    bc.close()
  }
}

//////////////////////////////////////////////////////////////////
// Items
//////////////////////////////////////////////////////////////////

export async function setItemWithList(item: Item) {
  const ao = kv.atomic()

  const res = await ao
    .set(['items', item.id], item)
    .set(['items_by_listId', item.listId, item.id], item)
    .commit()

  if (res.ok) {
    console.log('broadcasting item update', item.id, res.versionstamp)
    const bc = new BroadcastChannel(`items_by_listId/${item.listId}`)
    const items = await getItemsByListId(item.listId)
    bc.postMessage({ items, versionstamp: res!.versionstamp })
    setTimeout(() => bc.close(), 5)
  }

  return res.ok
}

export async function getItemById(id: string): Promise<Item> {
  const res = await kv.get<Item>(['items', id])
  return res.value
}

export async function getItemsByListId(listId: string): Promise<Item[]> {
  const iter = kv.list<Item>({ prefix: ['items_by_listId', listId] })

  const items = []
  for await (const { value } of iter) {
    items.push(value)
  }
  return items
}

export async function deleteItem(item: Item) {
  const ao = kv.atomic()

  const res = await ao
    .delete(['items', item.id])
    .delete(['items_by_listId', item.listId, item.id])
    .commit()

  if (res.ok) {
    console.log('broadcasting item delete', item.id, res.versionstamp)
    const bc = new BroadcastChannel(`items_by_listId/${item.listId}`)
    const items = await getItemsByListId(item.listId)
    bc.postMessage({ items, versionstamp: res!.versionstamp })
    setTimeout(() => bc.close(), 5)
  }

  return res.ok
}

export function subscribeItemsByList(listId: string, cb: (items: Item[]) => void) {
  const bc = new BroadcastChannel(`items_by_listId/${listId}`)
  let closed = false
  getItemsByListId(listId).then((items) => {
    if (closed) return
    cb(items)
    const lastVersionstamps = new Map<Item[], string>()
    bc.onmessage = (e) => {
      const { items, versionstamp } = e.data
      console.log(
        'received items_by_listId update',
        items,
        versionstamp,
        `(last: ${lastVersionstamps.get(items)})`,
      )
      if ((lastVersionstamps.get(items) ?? '') >= versionstamp) return
      lastVersionstamps.set(items, versionstamp)
      cb(items)
    }
  })
  return () => {
    closed = true
    bc.close()
  }
}

//////////////////////////////////////////////////////////////////
// Notes
//////////////////////////////////////////////////////////////////

export async function setNoteWithUser(note: Note) {
  const ao = kv.atomic()

  const res = await ao
    .set(['notes', note.id], note)
    .set(['notes_by_userId', note.userId, note.id], note)
    .commit()

  if (res.ok) {
    console.log('broadcasting note update', note.id, res.versionstamp)
    const bc = new BroadcastChannel(`notes/${note.userId}`)
    bc.postMessage({ note, versionstamp: res!.versionstamp })
    setTimeout(() => bc.close(), 5)
  }

  return res.ok
}

export async function getNoteById(id: string): Promise<Note> {
  const res = await kv.get<Note>(['notes', id])
  return res.value
}

export async function getNotesByUserId(userId: string): Promise<Note[]> {
  const iter = kv.list<Note>({ prefix: ['notes_by_userId', userId] })

  const notes = []
  for await (const { value } of iter) {
    notes.push(value)
  }
  return notes
}

export function subscribeNotesById(noteId: string, cb: (note: Note) => void) {
  const bc = new BroadcastChannel(`notes/${noteId}`)
  let closed = false
  getNoteById(noteId).then((note) => {
    if (closed) return
    cb(note)
    const lastVersionstamps = new Map<string, string>()
    bc.onmessage = (e) => {
      const { note, versionstamp } = e.data
      console.log(
        'received notes_by_id update',
        note.id,
        versionstamp,
        `(last: ${lastVersionstamps.get(note.id)})`,
      )
      if ((lastVersionstamps.get(note.id) ?? '') >= versionstamp) return
      lastVersionstamps.set(note.id, versionstamp)
      cb(note)
    }
  })
  return () => {
    closed = true
    bc.close()
  }
}
