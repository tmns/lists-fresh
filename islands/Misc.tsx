import { Dialog, Menu, Transition } from '@headlessui/react'
import ArrowLeftOnRectangleIcon from 'components/icons/ArrowLeftOnRectangleIcon.tsx'
import PencilSquareIcon from 'components/icons/PencilSquareIcon.tsx'
import { Fragment } from 'preact'
import { useMemo, useRef } from 'preact/hooks'
import { User } from 'utils/types.ts'

type UserProps = {
  user: User
}

export function UserMenu({ user }: UserProps) {
  return (
    <Menu>
      <Menu.Button className="-m-1.5 flex items-center p-1.5">
        <span className="sr-only">Open user menu</span>
        <img
          class="h-8 w-8 rounded-full bg-gray-50"
          src={user.image}
          alt=""
          width={32}
          height={32}
        />
      </Menu.Button>
      <div class="absolute z-50 translate-y-full -top-7">
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Menu.Items className="w-32 rounded-md bg-gray-900 p-2 text-sm text-white ring-1 ring-black ring-opacity-5 drop-shadow-xl focus:outline-none">
            <Menu.Item className="flex w-full items-center rounded-sm p-2 transition-colors duration-300 hover:bg-gray-800">
              <a class="flex items-center gap-4" href="/notes">
                <PencilSquareIcon styles="h-4 w-4" aria-hidden />
                Notes
              </a>
            </Menu.Item>
            <Menu.Item className="flex w-full items-center rounded-sm p-2 transition-colors duration-300 hover:bg-gray-800">
              <a class="flex items-center gap-4" href="/auth/signout">
                <ArrowLeftOnRectangleIcon styles="h-4 w-4" aria-hidden />
                Logout
              </a>
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </div>
    </Menu>
  )
}

interface MessageProps {
  dismiss: () => void
  message: string
}

export function Message(props: MessageProps) {
  const savedMessage = useRef('')
  const message = useMemo(() => {
    if (props.message) {
      savedMessage.current = props.message
      return props.message
    } else {
      return savedMessage.current
    }
  }, [props.message])

  const shouldShow = Boolean(props.message)

  return (
    <Transition appear show={shouldShow} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={props.dismiss}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Oops!
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={props.dismiss}
                  >
                    Got it!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
