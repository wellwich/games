export const metadata = {
    title: 'ライツアウト',
    description: 'シンプルなライツアウト',
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