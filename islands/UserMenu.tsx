import { Menu, Transition } from '@headlessui/react'
import ArrowLeftOnRectangleIcon from 'components/icons/ArrowLeftOnRectangle.tsx'
import { User } from 'utils/types.ts'

type UserProps = {
  user: User
}

export default function UserMenu({ user }: UserProps) {
  return (
    <Menu>
      <Menu.Button className="-m-1.5 mr-2 flex items-center p-1.5">
        <span className="sr-only">Open user menu</span>
        <img
          class="h-8 w-8 rounded-full bg-gray-50"
          src={user.image}
          alt=""
          width={32}
          height={32}
        />
      </Menu.Button>
      <div class="absolute translate-y-full">
        <Transition
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Menu.Items className="z-50 w-32 rounded-md bg-gray-900 p-2 text-sm text-white ring-1 ring-black ring-opacity-5 drop-shadow-xl focus:outline-none">
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
