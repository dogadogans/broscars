'use client'

import { useEffect } from 'react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <p className="font-serif text-2xl text-white">Bir şeyler ters gitti</p>
      <p className="text-sm text-white/50">{error.message ?? 'Beklenmedik bir hata oluştu.'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-white/90"
      >
        Tekrar dene
      </button>
    </div>
  )
}
