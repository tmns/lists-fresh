import UserMenu from 'islands/UserMenu.tsx'
import { User } from 'utils/types.ts'

interface HeaderProps {
  user: User
}

export default function Header(props: HeaderProps) {
  return (
    <header class="flex items-center justify-end p-4 mx-2 shadow-[0px_1px_0px_rgb(255,255,255,.09)]">
      <UserMenu user={props.user} />
    </header>
  )
}
