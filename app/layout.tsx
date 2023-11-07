import type { Metadata } from 'next'
import './globals.css'
import Info from '../components/Info'

export const metadata: Metadata = {
  title: {
    default: '無料ブラウザゲームサイト＠うぇる',
    template: `%s | 無料ブラウザゲームサイト＠うぇる`
  },
  description: '無料でブラウザゲームが遊べるサイトです。',
  verification: {
    google: '9B1ozRnCZU3XL8e5dpDVtJ2YTltQ-Q7qvBJIskqusdg',
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className=' lg:w-3/4 lg:mx-auto mt-8'>
        <header>
          <nav className="flex items-center justify-between flex-wrap bg-gray-500 p-6">
            <div className="flex items-center flex-shrink-0 text-white mr-6">
              <h1 className="font-semibold text-xl tracking-tight">無料ブラウザゲームサイト＠うぇる</h1>
            </div>
            <div className="w-full block flex-grow md:flex md:items-center md:w-auto">
              <div className="text-sm md:flex-grow">
                <a href="/" className="block mt-4 md:inline-block md:mt-0 text-gray-200 hover:text-white mr-4">
                  ホーム
                </a>
                <a href="/games" className="block mt-4 md:inline-block md:mt-0 text-gray-200 hover:text-white mr-4">
                  ゲーム
                </a>
              </div>
            </div>
          </nav>
        </header>

        <Info />
        <div className=' px-16'>
          {children}
        </div>
      </body>
    </html>
  )
}
