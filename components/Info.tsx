const info = [
    {
        id: 1,
        title: 'サイト立ち上げました',
        description: 'サイトを立ち上げました。\nこれからゲームを作って公開していきます。',
        category: 'お知らせ',
        path: '/info',
        date: '2023/11/07',
    }
]

const Info = () => {
    info.length = 3
    return (
        <ul className=" m-0 p-0">
            {info.map((info) => (
                <li key={info.id} className=" border-b border-gray-400 p-2 first:border-t">
                    <a href={info.path + "#" + info.id} className="flex flex-wrap md:flex-nowrap">
                        <p className="md:min-w-[140px] min-w-[100px] text-gray-400 pr-5">{info.date}</p>
                        <p className="min-w-[140px] pr-5"><span className=" bg-gray-400 text-white text-center inline-block py-1 px-5 text-[12px] leading-none">{info.category}</span></p>
                        <p className=" mt-2 md:m-0 w-full hover:text-blue-800">{info.title}</p>
                    </a>
                </li>
            ))}
        </ul>
    )
}

export default Info;