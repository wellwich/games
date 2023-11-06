export const metadata = {
    title: 'ブロック崩し',
    description: 'シンプルなブロック崩し',
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