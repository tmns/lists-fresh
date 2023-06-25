export default function Home() {
  return (
    <main class="flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 class="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">Just Lists</h1>
      <p class="text-md text-white">Nothing more, nothing less.</p>
      <p class="text-md text-zinc-400 transition-colors duration-300 hover:text-white">
        <a href="/signin">Get started</a>
      </p>
    </main>
  )
}
