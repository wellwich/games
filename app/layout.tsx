import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '無料ブラウザゲームサイト＠うぇる',
    template: `%s | 無料ブラウザゲームサイト＠うぇる`
  },
  description: '無料でブラウザで遊べるゲームサイトです。',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className='lg:mx-64 mt-8'>
        <header>
          <nav className="flex items-center justify-between flex-wrap bg-gray-500 p-6">
            <div className="flex items-center flex-shrink-0 text-white mr-6">
              <h1 className="font-semibold text-xl tracking-tight">無料ブラウザゲームサイト＠うぇる</h1>
            </div>
            <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
              <div className="text-sm lg:flex-grow">
                <a href="/" className="block mt-4 lg:inline-block lg:mt-0 text-gray-200 hover:text-white mr-4">
                  ホーム
                </a>
                <a href="/games" className="block mt-4 lg:inline-block lg:mt-0 text-gray-200 hover:text-white mr-4">
                  ゲーム
                </a>
              </div>
            </div>
          </nav>
        </header>
        <div className=' px-16'>
          {children}
        </div>
      </body>
    </html>
  )
}
