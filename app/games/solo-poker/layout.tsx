export const metadata = {
    title: 'ソロポーカー',
    description: '練習用の一人型ポーカー',
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