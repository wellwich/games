export const metadata = {
    title: '8パズル',
    description: '数字をスライドさせて並べ替えるゲーム',
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