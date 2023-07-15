import Lists from 'islands/list/Lists.tsx'
import NewListForm from 'islands/list/NewListForm.tsx'
import { List } from 'utils/types.ts'

interface SideNavProps {
  lists: List[]
  userId: string
  isMobile?: boolean
}

export default function SideNav(props: SideNavProps) {
  const isMobile = Boolean(props.isMobile)

  return (
    <aside
      class={
        isMobile
          ? 'fixed inset-y-0 z-50 flex w-72 flex-col'
          : 'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col shadow-[1px_0px_0px_rgb(255,255,255,.09)]'
      }
    >
      <div class="flex grow flex-col overflow-visible bg-[#010524] px-6 pb-4">
        <div class="flex h-16 shrink-0 items-center text-3xl text-[#6466f1]">☑</div>
        <nav class="flex flex-1 flex-col">
          <ul class="flex flex-1 flex-col gap-y-7">
            <li>
              <div class="text-xs font-semibold leading-6 text-gray-400">Your lists</div>
              <Lists lists={props.lists} userId={props.userId} />
            </li>
          </ul>
        </nav>
        <NewListForm lists={props.lists} />
      </div>
    </aside>
  )
}
