export const metadata = {
    title: 'ナンバー＆ダイレクション',
    description: '数字と方向をタッチするゲーム',
}

function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}

export default RootLayout;

export const runtime = 'edge';