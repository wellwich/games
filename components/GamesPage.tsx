const games = [
    {
        name: "パズル",
        description: "パズルゲーム",
        children: [
            {
                name: "四川省",
                image: "https://assets.wellwich.com/web/sichuan_thumb.webp",
                path: "/games/sichuan",
                description: "麻雀牌を使った二角取りゲーム",
            },
            {
                name: "ライツアウト",
                image: "https://assets.wellwich.com/web/lightsout_thumb.webp",
                path: "/games/lightsout",
                description: "シンプルなライツアウト",
            },
            {
                name: "ヌイカゲーム",
                image: "https://assets.wellwich.com/web/watermelon_thumb.webp",
                path: "/games/watermelon",
                description: "スイカゲームのパクリ",
            },
            {
                name: "ナンバー＆ダイレクション",
                image: "https://assets.wellwich.com/web/number-and-direction_thumb.webp",
                path: "/games/number-and-direction",
                description: "数字と方向をタッチするゲーム",
            },
            {
                name: "8パズル",
                image: "https://assets.wellwich.com/web/eight-puzzle_thumb.webp",
                path: "/games/eight-puzzle",
                description: "数字をスライドさせて並べ替えるゲーム",
            }
        ]
    },
    {
        name: "ブロック崩し",
        description: "ブロックを壊すゲーム",
        children: [
            {
                name: "ブロック崩し",
                image: "https://assets.wellwich.com/web/breakout_thumb.webp",
                path: "/games/breakout",
                description: "シンプルなブロック崩し",
            }
        ]
    },
    {
        name: "トランプ",
        description: "トランプゲーム",
        children: [
            {
                name: "ソロポーカー",
                image: "https://assets.wellwich.com/web/solo-poker_thumb.webp",
                path: "/games/solo-poker",
                description: "練習用の一人型ポーカー",
            }
        ]
    }
]

const GamesPage = () => {
    return (
        <div>
            <h2 className="text-4xl font-bold">ゲーム</h2>
            <ul className="">
                {games.map((game) => (
                    <li key={game.name} className="p-4">
                        <div>
                            <h3 className="text-2xl font-bold">
                                {game.name}
                            </h3>
                            <ul className="grid lg:grid-cols-3 grid-cols-2">
                                {game.children.map((child) => (
                                    <li key={child.name} className="m-4 hover:bg-gray-200">
                                        <a href={child.path}>
                                            <div className="p-4 border-solid border-2 border-gray-400">
                                                <img src={child.image} className=" mx-auto w-32 object-contain" />
                                                <h4 className="text-xl font-bold ">
                                                    {child.name}
                                                </h4>
                                                {child.description}
                                            </div>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default GamesPage;