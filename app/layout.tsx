import type { Metadata } from 'next'
import './globals.css'
import { info } from './info/page'

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

        <h2 className="text-xs">お知らせ</h2>

        <ul className=" m-0 p-0">
          {info.map((info) => (
            <li className=" border-b border-gray-400 p-2 first:border-t">
              <a href={info.path + "#" + info.id} className="flex flex-wrap md:flex-nowrap">
                <p className="md:min-w-[140px] min-w-[100px] text-gray-400 pr-5">{info.date}</p>
                <p className="min-w-[140px] pr-5"><span className=" bg-gray-400 text-white text-center inline-block py-1 px-5 text-[12px] leading-none">{info.category}</span></p>
                <p className=" mt-2 md:m-0 w-full hover:text-blue-800">{info.title}</p>
              </a>
            </li>
          ))}
        </ul>
        <div className=' px-16'>
          {children}
        </div>
      </body>
    </html>
  )
}
