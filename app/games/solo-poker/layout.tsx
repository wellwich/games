export const metadata = {
    title: 'ソロポーカー',
    description: 'そろそろポーカーを覚えようかな？',
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