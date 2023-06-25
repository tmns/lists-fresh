import { Fragment } from 'preact'
import { Transition, Dialog } from '@headlessui/react'
import { useState } from 'preact/hooks'
import SideNav from 'components/SideNav.tsx'
import { List } from 'utils/types.ts'
import XMarkIcon from 'components/icons/XMarkIcon.tsx'
import Bars3Icon from 'components/icons/Bars3Icon.tsx'

interface MobileSideNavProps {
  lists: List[]
  userId: string
}

export default function MobileSideNav(props: MobileSideNavProps) {
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
