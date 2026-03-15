import { redirect } from 'next/navigation'

export default function YearLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { year: string }
}) {
  // Only reject clearly invalid year segments (non-numeric).
  // DB existence is not checked here because the admin page needs to load
  // before a year record exists — it's the page that creates the year.
  if (isNaN(parseInt(params.year, 10))) {
    redirect('/')
  }

  return (
    <div data-year={params.year}>
      {children}
    </div>
  )
}
