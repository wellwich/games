


export const info = [
    {
        id: 1,
        title: 'サイト立ち上げました',
        description: 'サイトを立ち上げました。\nこれからゲームを作って公開していきます。',
        category: 'お知らせ',
        path: '/info',
        date: '2023/11/07',
    }
]

export default function Info() {
    return (
        <>
            <h2 className="text-4xl font-bold">お知らせ</h2>
            <ul className=" mt-4 p-0">
                {info.map((info) => (
                    <div className=" border border-black">
                        <h3 className=" bg-gray-600 text-white" id={info.id.toString()}>{info.date}</h3>
                        <div className="flex text-xs">
                            <p className="">{info.title}</p>
                        </div>
                        <p>{info.description}</p>
                    </div>
                ))}
            </ul>
        </>
    )
}
export const runtime = "edge"