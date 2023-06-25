import OAuthOptions from '../../islands/OAuthOptions.tsx'

export default function Signin() {
  return (
    <main class="flex flex-col items-center justify-center gap-12 px-4 py-16">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-sky-100">
          Sign in to your account
        </h2>
      </div>
      <div class="sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div class="rounded-lg bg-white px-6 py-12 shadow sm:px-12">
          <div class="relative">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-gray-200" />
            </div>
            <div class="relative flex justify-center text-sm font-medium leading-6">
              <span class="bg-white px-6 text-gray-900">You can use the following to sign in</span>
            </div>
          </div>
          <OAuthOptions />
        </div>
      </div>
    </main>
  )
}
