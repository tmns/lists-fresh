import UserMenu from 'islands/UserMenu.tsx'
import { User } from 'utils/types.ts'

interface HeaderProps {
  user: User
}

export default function Header(props: HeaderProps) {
  return (
    <header class="flex items-center justify-end p-4 shadow-subtle-b">
      <UserMenu user={props.user} />
    </header>
  )
}
