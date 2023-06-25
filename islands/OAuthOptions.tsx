export default function OAuthOptions() {
  return (
    <div class="mt-6 grid grid-cols-2 gap-4">
      <a
        class="flex w-full items-center justify-center gap-3 rounded-md border-2 border-gray-900 bg-cyan-100 px-3 py-1.5 text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
        href="/auth/signin?provider=google"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          class="h-5 w-5"
          width={20}
          height={20}
          alt=""
          aria-hidden="true"
        />
        <span class="text-sm font-semibold leading-6">Google</span>
      </a>
      <a
        class="flex w-full items-center justify-center gap-3 rounded-md border-2 border-[#404eed] bg-slate-50 px-3 py-1.5 text-[#404eed] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
        href="/auth/signin?provider=discord"
      >
        <img
          src="https://www.svgrepo.com/download/353655/discord-icon.svg"
          class="h-5 w-5"
          width={20}
          height={20}
          alt=""
          aria-hidden="true"
        />
        <span class="text-sm font-semibold leading-6">Discord</span>
      </a>
    </div>
  )
}
