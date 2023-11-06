export const metadata = {
    title: '四川省（二角取り）',
    description: '麻雀牌を使った二角取りゲーム',
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