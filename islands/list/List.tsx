import { Menu, Transition } from '@headlessui/react'
import { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import LoadingIndicator from 'components/LoadingIndicator.tsx'
import CheckIcon from 'components/icons/CheckIcon.tsx'
import EllipsisHorizontalIcon from 'components/icons/EllipsisHorizontal.tsx'
import PencilIcon from 'components/icons/PencilIcon.tsx'
import XMarkIcon from 'components/icons/XMarkIcon.tsx'
import type { List } from 'utils/types.ts'
import Message from 'islands/Message.tsx'
import DeleteOption from 'islands/list/DeleteOption.tsx'

interface ListProps {
  list: List
  lists: List[]
}

type UpdateListElements = HTMLFormControlsCollection & {
  name: HTMLInputElement
}

export default function List(props: ListProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const editNameInputRef = useRef<HTMLInputElement>(null)

  const path = window?.location?.pathname.split('/')
  const currentListId = path?.[path?.length - 1]

  async function updateName(e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    e.preventDefault()

    const editedName = (e.currentTarget.elements as UpdateListElements).name.value

    if (!editedName) return

    if (props.lists.some((list) => list.name === editedName)) {
      setError(`You already have a list with the name "${editedName}". Please choose another name.`)
      return
    }

    setIsSubmitting(true)

    try {
      const data = { listId: props.list.id, name: editedName }
      const res = await fetch('/api/list', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) setIsEditing(false)
    } catch (e) {
      console.error(e)
      editNameInputRef.current?.select()
    } finally {
      setIsSubmitting(false)
    }
  }

  function closeOnEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') setIsEditing(false)
  }

  useEffect(() => {
    if (!isEditing) return
    editNameInputRef.current?.select()
  }, [isEditing])

  return (
    <li
      class={`relative group/item flex cursor-pointer items-center justify-between rounded-sm text-left text-sm font-semibold leading-6 ${
        currentListId === props.list.id
          ? 'bg-gray-800 text-white'
          : 'text-gray-400 transition-colors duration-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {isEditing ? (
        <form class="flex w-full pl-2" onSubmit={updateName}>
          <label for="name" class="sr-only">
            New list name
          </label>
          <input
            class="w-4/5 bg-transparent pl-2"
            ref={editNameInputRef}
            onKeyUp={closeOnEsc}
            id="name"
            name="name"
            required
            defaultValue={props.list.name}
          />
          <button class="ml-4 p-2 text-zinc-400 hover:text-white" disabled={isSubmitting}>
            <LoadingIndicator isLoading={isSubmitting}>
              <CheckIcon styles="h-4 w-4 transition-colors duration-300" aria-hidden />
            </LoadingIndicator>
            <span class="sr-only">Save new title</span>
          </button>
          <button class="p-2 text-zinc-400 hover:text-white" onClick={() => setIsEditing(false)}>
            <XMarkIcon styles="h-4 w-4 transition-colors duration-300" aria-hidden />
            <span class="sr-only">Cancel new title</span>
          </button>
          <Message message={error} dismiss={() => setError('')} />
        </form>
      ) : (
        <Menu>
          <div class="flex w-full items-center justify-between px-4 py-1">
            <a href={`/lists/${props.list.id}`} class="flex-1">
              <span class="truncate">{props.list.name}</span>
            </a>
            <Menu.Button className="flex h-4 place-items-center rounded-sm opacity-0 transition-colors duration-300 hover:bg-zinc-600 hover:text-white group-focus-within/item:opacity-100 group-hover/item:opacity-100">
              <EllipsisHorizontalIcon styles="h-6 w-6" aria-hidden />
              <span class="sr-only">Options</span>
            </Menu.Button>
          </div>
          <div class="absolute translate-y-full left-0 bottom-0 translate-x-full z-50">
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="z-50 w-56 rounded-md bg-gray-900 p-2 text-sm text-white ring-1 ring-black ring-opacity-5 drop-shadow-xl focus:outline-none">
                <DeleteOption listId={props.list.id} />
                <Menu.Item>
                  <button
                    class="flex w-full items-center gap-4 rounded-sm p-2 transition-colors duration-300 hover:bg-gray-800"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon styles="h-4 w-4" aria-hidden />
                    <span>Rename</span>
                  </button>
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </div>
        </Menu>
      )}
    </li>
  )
}
