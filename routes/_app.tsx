import 'preact/debug'

import { AppProps } from '$fresh/server.ts'
import { Head } from '$fresh/runtime.ts'

export default function App({ Component }: AppProps) {
  return (
    <html class="h-full bg-[#010524] overflow-hidden">
      <Head>
        <title>Just Lists</title>
        <meta name="title" content="" />
        <meta name="description" content="" />
      </Head>
      <body class="h-full text-slate-600">
        <Component />
      </body>
    </html>
  )
}
