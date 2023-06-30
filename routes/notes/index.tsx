import { HandlerContext, PageProps } from '$fresh/server.ts'
import { v4 } from 'v4'
import Dashboard from 'components/Dashboard.tsx'
import { getListsByUserId, getNotesByUserId, getUserBySession, setNoteWithUser } from 'utils/db.ts'
import { Note, List, State, User } from 'utils/types.ts'
import Editor from '../../islands/notes/Editor.tsx'

type Data = SignedInData | null

interface SignedInData {
  user: User
  lists: List[]
  note: Note
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

  const [lists, notes] = await Promise.all([getListsByUserId(user.id), getNotesByUserId(user.id)])

  const sortedLists = lists.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))

  let note: Note | undefined = notes[0]
  if (!note) {
    note = {
      id: v4.generate(),
      content: JSON.stringify({ type: 'doc', content: [] }),
      userId: user.id,
      instanceId: v4.generate(),
      createdAt: new Date().toISOString(),
    }
    setNoteWithUser(note)
  }

  return ctx.render({ user, lists: sortedLists, note })
}

export default function Lists(props: PageProps<Data>) {
  return (
    <Dashboard user={props.data!.user} lists={props.data!.lists}>
      <div class="p-4">
        <Editor note={props.data!.note} />
      </div>
    </Dashboard>
  )
}
