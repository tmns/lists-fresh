import LoadingIndicator from 'components/LoadingIndicator.tsx'
import CheckIcon from 'components/icons/CheckIcon.tsx'
import PencilIcon from 'components/icons/PencilIcon.tsx'
import PlusIcon from 'components/icons/PlusIcon.tsx'
import TrashIcon from 'components/icons/TrashIcon.tsx'
import XMarkIcon from 'components/icons/XMarkIcon.tsx'
import { Message } from 'islands/Misc.tsx'
import { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { useDataSubscription } from 'utils/hooks.ts'
import { Item } from 'utils/types.ts'
import ClipboardDocumentCheckIcon from '../../components/icons/ClipboardDocumentCheckIcon.tsx'
import ClipboardDocumentIcon from '../../components/icons/ClipboardDocumentIcon.tsx'

type ItemProps = {
  item: Item
  items: Item[]
}

type UpdateTitleElements = HTMLFormControlsCollection & {
  title: HTMLInputElement
}

export function Item(props: ItemProps) {
  const editTitleInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [titleCopied, setTitleCopied] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEditing) return
    editTitleInputRef.current?.select()
  }, [isEditing])

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

  function closeOnEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') setIsEditing(false)
  }

  async function copyTitle() {
    await navigator.clipboard.writeText(props.item.title)
    setTitleCopied(true)
    setTimeout(() => setTitleCopied(false), 500)
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
          class={`ml-4 truncate text-ellipsis ${
            props.item.isChecked ? 'text-zinc-400' : ''
          } transition-colors duration-300`}
        >
          {props.item.title}
        </span>
      )}
      <div
        class={`${
          isEditing ? 'opacity-100' : '[@media(hover:hover)]:opacity-0'
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
          <>
            <button class="p-2 text-zinc-400 hover:text-white" onClick={copyTitle}>
              {titleCopied ? (
                <ClipboardDocumentCheckIcon
                  styles="h-4 w-4 transition-colors duration-300 "
                  aria-hidden
                />
              ) : (
                <ClipboardDocumentIcon
                  styles="h-4 w-4 transition-colors duration-300 "
                  aria-hidden
                />
              )}
              <span class="sr-only">Copy item title</span>
            </button>
            <button class="p-2 text-zinc-400 hover:text-white" onClick={showEditTitleInput}>
              <PencilIcon styles="h-4 w-4  transition-colors duration-300 " aria-hidden />
              <span class="sr-only">Edit item title</span>
            </button>
          </>
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function toggleItemCheck() {
    setIsSubmitting(true)

    try {
      const data = { isChecked: !props.isChecked, itemId: props.id }
      await fetch('/api/item', {
        method: 'PUT',
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
    <LoadingIndicator styles={{ width: '1.25rem' }} isLoading={isSubmitting}>
      <button
        type="button"
        class={`flex shrink-0 basis-5 h-5 w-5 items-center justify-center rounded transition-colors duration-300 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 ${
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
    </LoadingIndicator>
  )
}

interface ItemsProps {
  items: Item[]
}

export function Items(props: ItemsProps) {
  const [items, setItems] = useState(props.items)

  const path = window?.location?.pathname.split('/')
  const listId = path?.[path?.length - 1]

  // General approach taken from https://github.com/denoland/tic-tac-toe
  useDataSubscription(() => {
    const eventSource = new EventSource(`/api/events/items?listId=${encodeURIComponent(listId)}`)

    eventSource.onmessage = (e) => {
      const newItems = JSON.parse(e.data) as Item[]
      const sortedItems = newItems.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))
      setItems(sortedItems)
    }

    return () => eventSource.close()
  }, [listId])

  return (
    <>
      <ul class="divide-y divide-zinc-400/40 px-3 sm:px-4 py-2 lg:px-2">
        {items.length === 0 ? (
          <li class="p-2">
            This list doesn't have any items yet. Add some items by using the form below!
          </li>
        ) : (
          items.map((item) => <Item key={item.id} items={items} item={item} />)
        )}
      </ul>
      <NewItemForm listId={listId} items={items} />
    </>
  )
}

type NewItemFormProps = {
  listId: string
  items: Item[]
}

type AddItemElements = HTMLFormControlsCollection & {
  title: HTMLInputElement
}

export function NewItemForm(props: NewItemFormProps) {
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
