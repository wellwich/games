export const metadata = {
    title: 'ヌイカゲーム',
    description: 'スイカゲームのパクリ',
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