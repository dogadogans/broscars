import type { Metadata } from 'next'
import { Noto_Sans, Noto_Serif } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/context/LangContext'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const notoSerif = Noto_Serif({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-noto-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Broscar',
  description: 'Siz ve arkadaşlarınız için Oscar tahminleri',
  openGraph: {
    title: 'Broscar',
    description: 'Siz ve arkadaşlarınız için Oscar tahminleri',
    images: ['/oscar-big.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  return (
    <html lang="tr" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <head>
        {supabaseUrl && (
          <link rel="preconnect" href={supabaseUrl} />
        )}
      </head>
      <body>
        <LangProvider>
          <a className="skip-link" href="#main-content">
            İçeriğe geç
          </a>
          <div className="flex min-h-screen flex-col">
            <Nav />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>
        </LangProvider>
      </body>
    </html>
  )
}
