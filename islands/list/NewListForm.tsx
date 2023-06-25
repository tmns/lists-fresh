import { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import LoadingIndicator from 'components/LoadingIndicator.tsx'
import PlusIcon from 'components/icons/PlusIcon.tsx'
import XMarkIcon from 'components/icons/XMarkIcon.tsx'
import { List } from 'utils/types.ts'
import Message from 'islands/Message.tsx'

interface NewListFormProps {
  lists: List[]
}

type AddListElements = HTMLFormControlsCollection & {
  listName: HTMLInputElement
}

export default function NewListForm(props: NewListFormProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const newListInputRef = useRef<HTMLInputElement>(null)

  async function addList(e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault()

    const newListName = (e.currentTarget.elements as AddListElements).listName.value

    if (!newListName) return

    if (props.lists.some((list) => list.name === newListName)) {
      setError(
        `You already have a list with the name "${newListName}". Please choose another name.`,
      )
      return
    }

    setIsSubmitting(true)

    try {
      const data = { name: newListName }
      const res = await fetch('/api/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()
      if (body.id) window.location.href = `/lists/${body.id}`
    } catch (e) {
      console.error(e)
      newListInputRef.current?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  function closeOnEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') setIsCreating(false)
  }

  useEffect(() => {
    if (!isCreating) return
    newListInputRef.current?.focus()
  }, [isCreating])

  return (
    <div class="relative mt-auto w-full text-start text-gray-400 shadow-subtle-t">
      {isCreating ? (
        <>
          <button
            class="absolute right-0 top-0 p-2 hover:text-white"
            onClick={() => setIsCreating(false)}
          >
            <XMarkIcon styles="h-5 w-5 transition-colors duration-300" aria-hidden />
            <span class="sr-only">Cancel adding list</span>
          </button>
          <form class="p-4 pl-1 pr-0" onSubmit={addList} ref={formRef}>
            <label for="listName">List name</label>
            <div class="mt-1 flex justify-between">
              <input
                class="w-44 rounded-sm border border-l-0 border-r-0 border-t-0 border-zinc-400 bg-transparent px-2"
                ref={newListInputRef}
                onKeyUp={closeOnEsc}
                type="text"
                id="listName"
                name="listName"
                required
              />
              <button
                class="-m-2 mr-0 p-2 transition-colors duration-300 hover:text-white"
                disabled={isSubmitting}
              >
                <LoadingIndicator isLoading={isSubmitting} styles={{ width: '1.25rem' }}>
                  <PlusIcon styles="h-5 w-5" aria-hidden />
                </LoadingIndicator>
                <span class="sr-only">Add list</span>
              </button>
            </div>
          </form>
        </>
      ) : (
        <button
          class="flex w-full items-center p-4 pl-1 transition-colors duration-300 hover:bg-gray-800 hover:text-white"
          onClick={() => setIsCreating(true)}
        >
          <PlusIcon styles="h-5 w-5" aria-hidden />
          <span class="ml-2">New list</span>
        </button>
      )}
      <Message message={error} dismiss={() => setError('')} />
    </div>
  )
}
