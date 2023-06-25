import { Menu } from '@headlessui/react'
import { JSX } from 'preact'
import { useState } from 'preact/hooks'
import LoadingIndicator from '../../components/LoadingIndicator.tsx'
import TrashIcon from '../../components/icons/TrashIcon.tsx'

type DeleteOptionProps = {
  listId: string
}

export default function DeleteOption(props: DeleteOptionProps) {
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
    <Menu.Item className="flex w-full items-center rounded-sm p-2 transition-colors duration-300 hover:bg-gray-800">
      {({ close }: { close: () => void }) => (
        <button onClick={(e) => deleteList(e, close)} disabled={isSubmitting}>
          <LoadingIndicator isLoading={isSubmitting} styles={{ width: '1.15rem' }}>
            <TrashIcon styles="h-4 w-4" aria-hidden />
          </LoadingIndicator>
          <span className="ml-4">Delete</span>
        </button>
      )}
    </Menu.Item>
  )
}
