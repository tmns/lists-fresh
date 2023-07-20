import type { VNode } from 'preact'
import { MobileSideNav } from 'islands/list/List.tsx'
import { List, User } from 'utils/types.ts'
import Header from 'components/Header.tsx'
import SideNav from 'components/SideNav.tsx'

interface DashboardProps {
  user: User
  lists: List[]
  children: VNode
}

export default function Dashboard(props: DashboardProps) {
  return (
    <div class="text-white">
      <MobileSideNav lists={props.lists} userId={props.user.id} />
      <SideNav lists={props.lists} userId={props.user.id} />
      <div class="lg:pl-72">
        <Header user={props.user} />
        <main class="flex flex-col min-h-[calc(100vh_-_74px)] after:content-[''] after:absolute after:inset-0 after:[background:linear-gradient(rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_100%)] after:pointer-events-none">
          {props.children}
        </main>
      </div>
    </div>
  )
}
