import { LayoutProps } from '$fresh/server.ts'

export default function Layout({ Component }: LayoutProps) {
  return (
    <main class="flex flex-col items-center justify-center gap-12 px-4 py-16">
      <Component />
    </main>
  )
}
