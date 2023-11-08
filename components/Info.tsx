const info = [
    {
        id: 1,
        title: 'サイト立ち上げました',
        category: 'お知らせ',
        color: 'bg-blue-400',
        path: '/games',
        date: '2023/11/07',
    },
    {
        id: 2,
        title: '四川省を追加しました',
        category: 'リリース',
        color: 'bg-green-400',
        path: '/games/sichuan',
        date: '2023/11/07',
    },
    {
        id: 3,
        title: 'ブロック崩しを追加しました',
        category: 'リリース',
        color: 'bg-green-400',
        path: '/games/breakout',
        date: '2023/11/07',
    },
    {
        id: 4,
        title: 'ライツアウトを追加しました',
        category: 'リリース',
        color: 'bg-green-400',
        path: '/games/lightsout',
        date: '2023/11/08',
    }
]

const Info = () => {
    // infoをidの降順に並び替える
    info.sort((a, b) => {
        if (a.id < b.id) return 1;
        if (a.id > b.id) return -1;
        return 0;
    })
    return (
        <div className="overflow-y-scroll h-32 md:h-24 border border-b">
            <ul className=" m-0 p-0">
                {info.map((info) => (
                    <li key={info.id} className=" border-b border-gray-400 p-2 first:border-t">
                        <a href={info.path} className="flex flex-wrap md:flex-nowrap">
                            <p className="md:min-w-[140px] min-w-[100px] text-gray-400 pr-5">{info.date}</p>
                            <p className="min-w-[140px] pr-5"><span className={`${info.color} text-white text-center inline-block py-1 w-[80px] text-[12px] leading-none`}>{info.category}</span></p>
                            <p className=" mt-2 md:m-0 w-full hover:text-blue-800">{info.title}</p>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Info;