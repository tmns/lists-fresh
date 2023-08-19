import { Dialog, Menu, Transition } from '@headlessui/react'
import LoadingIndicator from 'components/LoadingIndicator.tsx'
import SideNav from 'components/SideNav.tsx'
import Bars3Icon from 'components/icons/Bars3Icon.tsx'
import CheckIcon from 'components/icons/CheckIcon.tsx'
import EllipsisHorizontalIcon from 'components/icons/EllipsisHorizontal.tsx'
import PencilIcon from 'components/icons/PencilIcon.tsx'
import PlusIcon from 'components/icons/PlusIcon.tsx'
import XMarkIcon from 'components/icons/XMarkIcon.tsx'
import TrashIcon from 'components/icons/TrashIcon.tsx'
import { Message } from 'islands/Misc.tsx'
import { Fragment, JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { useDataSubscription } from 'utils/hooks.ts'
import type { List } from 'utils/types.ts'

interface ListProps {
  list: List
  lists: List[]
}

type UpdateListElements = HTMLFormControlsCollection & {
  name: HTMLInputElement
}

export function List(props: ListProps) {
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
          ? 'bg-[#0d112f] text-white'
          : 'text-gray-400 transition-colors duration-300 hover:bg-[#0d112f] hover:text-white'
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
            <Menu.Button class="flex h-4 place-items-center rounded-sm [@media(hover:hover)]:opacity-0 transition-colors duration-300 hover:bg-gray-800 hover:text-white group-focus-within/item:opacity-100 group-hover/item:opacity-100">
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
              <Menu.Items class="w-56 rounded-md bg-gray-900 p-2 text-sm text-white ring-1 ring-black ring-opacity-5 drop-shadow-xl focus:outline-none">
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

type DeleteOptionProps = {
  listId: string
}

export function DeleteOption(props: DeleteOptionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function deleteList(e: JSX.TargetedEvent<HTMLButtonElement, Event>, close: () => void) {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      const data = { id: props.listId }
      const res = await fetch('/api/list/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        close()
        window.location.href = '/lists'
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Menu.Item class="flex w-full items-center rounded-sm p-2 transition-colors duration-300 hover:bg-gray-800">
      {({ close }: { close: () => void }) => (
        <button onClick={(e) => deleteList(e, close)} disabled={isSubmitting}>
          <LoadingIndicator isLoading={isSubmitting} styles={{ width: '1.15rem' }}>
            <TrashIcon styles="h-4 w-4" aria-hidden />
          </LoadingIndicator>
          <span class="ml-4">Delete</span>
        </button>
      )}
    </Menu.Item>
  )
}

interface ListsProps {
  lists: List[]
  userId: string
}

export function Lists(props: ListsProps) {
  const [lists, setLists] = useState(props.lists)

  // General approach taken from https://github.com/denoland/tic-tac-toe
  useDataSubscription(() => {
    const eventSource = new EventSource('/api/events/lists')

    eventSource.onmessage = (e) => {
      const newLists = JSON.parse(e.data) as List[]
      const sortedLists = newLists.sort((a, b) => a.createdAt?.localeCompare(b.createdAt))
      setLists(sortedLists)
    }

    return () => eventSource.close()
  }, [])

  return (
    <ul class="-mx-2 space-y-1">
      {lists.map((list) => (
        <List key={list.id} lists={lists} list={list} />
      ))}
    </ul>
  )
}

interface NewListFormProps {
  lists: List[]
}

type AddListElements = HTMLFormControlsCollection & {
  listName: HTMLInputElement
}

export function NewListForm(props: NewListFormProps) {
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
        `You already have a list with the name "${newListName}". Please choose another name.`
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
    <div class="relative mt-auto w-full text-start text-gray-400 shadow-[0px_-1px_0px_rgb(255,255,255,.09)]">
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
          class="rounded-md flex w-full items-center p-4 pl-1 transition-colors duration-300 hover:bg-[#0d112f] hover:text-white"
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

interface MobileSideNavProps {
  lists: List[]
  userId: string
}

export function MobileSideNav(props: MobileSideNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <div class="absolute top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b0 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          class="-m-2.5 p-2.5 text-white lg:hidden"
          onClick={() => setIsOpen(true)}
        >
          <span class="sr-only">Open sidebar</span>
          <Bars3Icon styles="h-6 w-6" aria-hidden="true" />
        </button>
        <div class="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />
      </div>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div class="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>
          <div class="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel class="relative mr-16 flex w-full max-w-xs">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div class="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" class="-m-2.5 p-2.5" onClick={() => setIsOpen(false)}>
                      <span class="sr-only">Close sidebar</span>
                      <XMarkIcon styles="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {isOpen && <SideNav lists={props.lists} userId={props.userId} isMobile />}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}
