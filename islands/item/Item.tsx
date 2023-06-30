import { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import LoadingIndicator from 'components/LoadingIndicator.tsx'
import CheckIcon from 'components/icons/CheckIcon.tsx'
import PencilIcon from 'components/icons/PencilIcon.tsx'
import TrashIcon from 'components/icons/TrashIcon.tsx'
import XMarkIcon from 'components/icons/XMarkIcon.tsx'
import { Item } from 'utils/types.ts'
import Message from 'islands/Message.tsx'

type ItemProps = {
  item: Item
  items: Item[]
}

type UpdateTitleElements = HTMLFormControlsCollection & {
  title: HTMLInputElement
}

export default function Item(props: ItemProps) {
  const editTitleInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function updateTitle(e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault()

    setError('')

    const editedTitle = (e.currentTarget.elements as UpdateTitleElements).title.value

    if (props.items.some((item) => item.title === editedTitle)) {
      setError(
        `You already have an item with the title "${editedTitle}". Try choosing a different title.`,
      )
      return
    }

    setIsSubmitting(true)

    try {
      const data = { itemId: props.item.id, title: editedTitle }
      const res = await fetch('/api/item', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) setIsEditing(false)
    } catch (e) {
      console.error(e)
      editTitleInputRef.current?.select()
    } finally {
      setIsSubmitting(false)
    }
  }

  function showEditTitleInput() {
    setIsEditing(true)
  }

  useEffect(() => {
    if (!isEditing) return
    editTitleInputRef.current?.select()
  }, [isEditing])

  function closeOnEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') setIsEditing(false)
  }

  return (
    <li class="group flex items-center p-2">
      <ToggleItemCheck id={props.item.id} isChecked={props.item.isChecked} />
      {isEditing ? (
        <form id="edit-title-form" class="flex-1" onSubmit={updateTitle}>
          <label for="title" class="sr-only">
            Edit title
          </label>
          <input
            class="ml-2 w-full bg-transparent px-2"
            ref={editTitleInputRef}
            onKeyUp={closeOnEsc}
            id="title"
            name="title"
            defaultValue={props.item.title}
            required
          />
          <Message message={error} dismiss={() => setError('')} />
        </form>
      ) : (
        <span
          class={`ml-4 ${
            props.item.isChecked ? 'text-zinc-400' : ''
          } transition-colors duration-300`}
        >
          {props.item.title}
        </span>
      )}
      <div
        class={`${
          isEditing ? 'opacity-100' : 'opacity-0'
        } ml-auto flex items-center focus-within:opacity-100 group-hover:opacity-100`}
      >
        {isEditing ? (
          <>
            <button
              form="edit-title-form"
              class="ml-4 p-2 text-zinc-400 hover:text-white"
              disabled={isSubmitting}
            >
              <LoadingIndicator isLoading={isSubmitting}>
                <CheckIcon styles="h-4 w-4  transition-colors duration-300 " aria-hidden />
              </LoadingIndicator>
              <span class="sr-only">Save new title</span>
            </button>
            <button class="p-2 text-zinc-400 hover:text-white" onClick={() => setIsEditing(false)}>
              <XMarkIcon styles="h-4 w-4  transition-colors duration-300 " aria-hidden />
              <span class="sr-only">Cancel new title</span>
            </button>
          </>
        ) : (
          <button class="p-2 text-zinc-400 hover:text-white" onClick={showEditTitleInput}>
            <PencilIcon styles="h-4 w-4  transition-colors duration-300 " aria-hidden />
            <span class="sr-only">Edit item title</span>
          </button>
        )}
        <DeleteItemBtn id={props.item.id} />
      </div>
    </li>
  )
}

type DeleteItemBtnProps = {
  id: string
}

function DeleteItemBtn(props: DeleteItemBtnProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function deleteItem() {
    setIsSubmitting(true)

    try {
      const data = { id: props.id }
      await fetch('/api/item', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button class="ml-4 p-2 text-zinc-400 hover:text-white" onClick={deleteItem}>
      <LoadingIndicator isLoading={isSubmitting}>
        <TrashIcon styles="h-4 w-4  transition-colors duration-300" aria-hidden />
      </LoadingIndicator>
      <span class="sr-only">Delete item</span>
    </button>
  )
}

type ToggleItemCheckProps = {
  id: string
  isChecked: boolean
}

function ToggleItemCheck(props: ToggleItemCheckProps) {
  async function toggleItemCheck() {
    try {
      const data = { isChecked: !props.isChecked, itemId: props.id }
      await fetch('/api/item', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <button
      type="button"
      class={`flex h-5 w-5 items-center justify-center rounded transition-colors duration-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 ${
        props.isChecked ? 'bg-[#6466f1]' : 'bg-slate-800'
      }`}
      defaultChecked={props.isChecked}
      checked={props.isChecked}
      onClick={toggleItemCheck}
      role="checkbox"
      aria-checked={props.isChecked}
    >
      {props.isChecked && (
        <span class="pointer-events-none">
          <CheckIcon styles="h-4 w-4 self-center text-white" />
        </span>
      )}
    </button>
  )
}
