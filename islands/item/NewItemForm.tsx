import { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import LoadingIndicator from 'components/LoadingIndicator.tsx'
import PlusIcon from 'components/icons/PlusIcon.tsx'
import Message from 'islands/Message.tsx'
import { Item } from 'utils/types.ts'

type NewItemFormProps = {
  listId: string
  items: Item[]
}

type AddItemElements = HTMLFormControlsCollection & {
  title: HTMLInputElement
}

export default function NewItemForm(props: NewItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const newItemInputRef = useRef<HTMLInputElement>(null)

  async function addNewItem(e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault()

    setError('')

    const newItemTitle = (e.currentTarget.elements as AddItemElements).title.value

    if (props.items.some((item) => item.title === newItemTitle)) {
      setError(
        `You already have an item with the title "${newItemTitle}". Please choose another name.`,
      )
      return
    }

    setIsSubmitting(true)

    try {
      const data = { title: newItemTitle, listId: props.listId }
      const res = await fetch('/api/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) (e.target as HTMLFormElement).reset()
    } catch (e) {
      console.error(e)
      newItemInputRef.current?.select()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div class="mt-auto px-5 sm:px-6 py-4 lg:px-4">
      <form class="flex items-center" onSubmit={addNewItem}>
        <label for="title">Add item</label>
        <input
          class="ml-4 flex-1 border-b border-zinc-400 bg-transparent px-2 transition-colors duration-300 hover:border-white focus:border-white"
          ref={newItemInputRef}
          type="text"
          id="title"
          name="title"
          required
        />
        <button
          class="flex items-center p-2 text-zinc-400 transition-colors duration-300 hover:text-white focus:text-white"
          disabled={isSubmitting}
        >
          <LoadingIndicator
            isLoading={isSubmitting}
            styles={{ width: '1.25rem', height: '1.25rem' }}
          >
            <PlusIcon styles="h-5 w-5 " aria-hidden />
          </LoadingIndicator>
          <span class="sr-only">Add item</span>
        </button>
      </form>
      <Message message={error} dismiss={() => setError('')} />
    </div>
  )
}
