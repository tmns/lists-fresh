import { Head } from '$fresh/runtime.ts'
import Focus from '@tiptap/extension-focus'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useMemo, useState } from 'preact/hooks'
import { Note } from 'utils/types.ts'
import { v4 } from 'v4'
import { useDataSubscription } from 'utils/hooks.ts'

interface EditorProps {
  note: Note
}

export default function EditorComponent(props: EditorProps) {
  const instanceId = useMemo(() => v4.generate(), [])
  const [content, setContent] = useState(() => JSON.parse(props.note.content))

  const editor = useEditor({
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg prose-p:text-white prose-headings:text-red-700 prose-code:text-red-700 prose-pre:text-red-700 prose-code:bg-slate-900 prose-pre:bg-slate-900 mx-auto focus:outline-none py-6 px-2  rounded-b-md h-100vh overflow-y-auto max-h-[calc(100vh_-_74px)]',
      },
    },
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return `H${node.attrs.level}`
          if (node.type.name === 'codeBlock') return 'Enter some code...'
          return 'Enter some text...'
        },
        showOnlyCurrent: false,
        showOnlyWhenEditable: false,
      }),
      Focus.configure({ className: 'focused' }),
      Highlight,
      Typography,
    ],
    onUpdate({ editor }) {
      debouncedFetch(editor, props.note.id, instanceId)
    },
  })

  // General approach taken from https://github.com/denoland/tic-tac-toe
  useDataSubscription(() => {
    const eventSource = new EventSource('/api/events/notes')

    eventSource.onmessage = (e) => {
      const updatedNote = JSON.parse(e.data) as Note | null
      if (!updatedNote || instanceId === updatedNote.instanceId) return

      setContent(JSON.parse(updatedNote.content))
    }

    return () => eventSource.close()
  }, [])

  useEffect(() => {
    if (!editor) return
    editor.commands.setContent(content)
  }, [editor, content])

  return (
    <>
      <Head>
        <style>
          {`.ProseMirror p.is-empty.focused::before,
            .ProseMirror .is-empty:not(p)::before {
              color: #515d69b3;
              content: attr(data-placeholder);
              float: left;
              height: 0;
              pointer-events: none;`}
        </style>
      </Head>
      <EditorContent editor={editor} />
    </>
  )
}

type UpdateNoteFetch = (editor: Editor, id: string, instanceId: string) => Promise<void>
let controller: AbortController

const debouncedFetch = debounce(async (editor, id, instanceId) => {
  const content = editor.getJSON()

  try {
    if (controller) controller.abort()

    controller = new AbortController()
    const signal = controller.signal

    const data = { id, content, instanceId }
    await fetch('/api/note', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal,
    })
  } catch (e) {
    if (e.name === 'AbortError') return
    console.error(e)
  }
}, 400)

function debounce(func: UpdateNoteFetch, wait: number) {
  let timeout: number | null

  return function executedFunction(...args: [editor: Editor, id: string, instanceId: string]) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(later, wait)
  }
}
