'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function YearError({
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
    <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-serif text-2xl" style={{ color: 'var(--color-text)' }}>
        Bir şeyler ters gitti
      </p>
      <p className="text-sm" style={{ color: 'var(--color-grey-3)' }}>
        {error.message ?? 'Beklenmedik bir hata oluştu.'}
      </p>
      <Button onClick={reset}>Tekrar dene</Button>
    </div>
  )
}
