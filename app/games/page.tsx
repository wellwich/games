import GamesPage from "../../components/GamesPage"
export const metadata = {
    title: 'ゲーム一覧',
    description: 'ゲーム一覧',
}

export default function Page() {
    return (
        <>
            <GamesPage />
        </>
    )
}

export const runtime = "edge"