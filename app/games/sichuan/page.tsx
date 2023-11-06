'use client'
import Phaser, { Game as GameType } from "phaser";
import { useState, useEffect } from "react";

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;
const TILE_TYPES = 34;
const BOARD_W = 17;
const BOARD_H = 8;
const W = BOARD_W + 2;
const H = BOARD_H + 2;
const TILE_WIDTH = Math.floor(80 / 2.5);
const TILE_HEIGHT = Math.floor(112 / 2.5);
const BLANK = 0;
const WALL = -1;

interface Ranking {
    name: string;
    score: number;
    date: string;
}

// ./api/ranking からランキングを取得する
async function getRanking() {
    const res = await fetch('https://api.wellwich.com/sichuan');
    const { results } = await res.json();
    return results;
}

async function postRanking(name: string, score: number) {
    const res = await fetch('https://api.wellwich.com/sichuan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, score: score }),
    });
    const { results } = await res.json();
    return results;
}

const range = (start: number, stop: number = start, step: number = start < stop ? 1 : -1): number[] => {
    const length = Math.max(0, Math.ceil((stop - start) / step));
    return Array.from({ length }, (_, i) => start + step * i);
};

const BW = BOARD_W + 4;
const BH = BOARD_H + 4;
const BOARD_WIDTH = (DEFAULT_WIDTH - BW * TILE_WIDTH) / 2;
const BOARD_HEIGHT = (DEFAULT_HEIGHT - BH * TILE_HEIGHT) / 2;
const X = (p: number) => p % BW;
const Y = (p: number) => Math.floor(p / BW);
const fromXY = (x: number, y: number) => x + y * BW;
const fromYX = (y: number, x: number): number => fromXY(x, y);

const move = (board: number[], p: number, d: number): number => board[p + d] ? p : move(board, p + d, d);

const pass = (
    board: number[],
    p: number,
    q: number,
    U: (p: number) => number,
    V: (p: number) => number,
    C: (u: number, v: number) => number
): boolean => {
    const e = C(1, 0);
    const u0 = Math.max(U(move(board, p, -e)), U(move(board, q, -e)));
    const u1 = Math.min(U(move(board, p, +e)), U(move(board, q, +e)));
    const v0 = Math.min(V(p), V(q)) + 1;
    const v1 = Math.max(V(p), V(q)) - 1;
    const us = range(u0, u1 + 1, 1);
    const vs = range(v0, v1 + 1, 1);
    return us.some(u => vs.every(v => board[C(u, v)] === 0));
};

const test = (board: number[], p: number, q: number): boolean =>
    p !== q &&
    board[p] === board[q] &&
    (pass(board, p, q, X, Y, fromXY) || pass(board, p, q, Y, X, fromYX));

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const partInSeconds = seconds % 60;
    const formattedSeconds = partInSeconds.toString().padStart(2, '0');
    return `${minutes}:${formattedSeconds}`;
}

class TitleScene extends Phaser.Scene {
    constructor() {
        super('titleScene');
    }
    create() {
        let background = this.add.rectangle(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT, 0x444444, 0.5);
        background.setOrigin(0, 0);
        background.setInteractive();
        let ranking = this.add.text(DEFAULT_WIDTH / 2, DEFAULT_HEIGHT - 16, 'ranking', { fontSize: '16px', fontFamily: '"font"' }).setOrigin(0.5, 1);
        ranking.setInteractive();
        ranking.on('pointerdown', () => {
            this.scene.start('rankingScene');
        });
        let title = this.add.text(DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2 - 50, '四川省', { fontSize: '64px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
        let start = this.add.text(DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2 + 100, 'Tap to start', { fontSize: '16px', fontFamily: '"font"' }).setOrigin(0.5, 0.5);
        // 画面のどこかをタップしたらゲーム画面へ
        background.on('pointerdown', () => {
            this.scene.start('gameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }
    preload() {
        this.load.setBaseURL('https://assets.wellwich.com');

        this.load.spritesheet('tiles', '/sichuan/images/tiles.png', { frameWidth: 80, frameHeight: 112 });
    }

    create() {
        let timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (initialTime > 1) {
                    initialTime -= 1; // One second
                    timeText.setText(formatTime(initialTime));
                } else {
                    timeText.setText(formatTime(0));
                    timer.remove();
                    let background = this.add.rectangle(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT, 0x444444, 0.5).setOrigin(0, 0);
                    background.setInteractive();
                    let over = this.add.text(DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2, 'GAME OVER', { fontSize: '64px', fontFamily: '"font"' }).setOrigin(0.5, 0.5);
                    over.setStroke('#000', 16);
                    let restart = this.add.text(DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2 + 100, 'Tap to restart', { fontSize: '16px', fontFamily: '"font"' }).setOrigin(0.5, 0.5);
                    restart.setStroke('#000', 8);
                    restart.setInteractive();
                    restart.on('pointerdown', () => {
                        this.scene.start('gameScene');
                    });
                }
            },
            callbackScope: this,
            loop: true
        });
        let initialTime = 600;
        let timeText = this.add.text(DEFAULT_WIDTH / 2, 16, formatTime(initialTime), { fontSize: '32px', color: '#fff', fontFamily: '"font"' }).setOrigin(0.5, 0);
        //　背景色を設定
        let background = this.add.rectangle(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT, 0x444444, 0.5);
        background.setOrigin(0, 0);
        background.setInteractive();

        let tiles: number[] = [];
        for (let n = 0; n < 4; n++) {
            for (let i = 0; i < TILE_TYPES; i++) {
                tiles.push(i);
            }
        }
        Phaser.Utils.Array.Shuffle(tiles);

        let board: number[][] = [];
        for (let i = 0; i < BH; i++) {
            for (let j = 0; j < BW; j++) {
                // 範囲外は-1
                if (i === 0 || i === BH - 1 || j === 0 || j === BW - 1) {
                    board[i] = board[i] || [];
                    board[i][j] = WALL;
                } else if (i === 1 || i === BH - 2 || j === 1 || j === BW - 2) {
                    board[i] = board[i] || [];
                    board[i][j] = BLANK;
                } else {
                    board[i] = board[i] || [];
                    board[i][j] = tiles.pop() as number + 1; //
                }
            }
        }

        let hold = this.add.sprite(-1, -1, 'tiles', 0);
        hold.setOrigin(0, 0);
        hold.setScale(0.4);
        hold.visible = false;
        let holdX = Math.floor(hold.x / TILE_WIDTH);
        let holdY = Math.floor(hold.y / TILE_HEIGHT);
        let mask = this.add.rectangle(0, 0, TILE_WIDTH, TILE_HEIGHT, 0x4444ff, 0.5).setOrigin(0, 0);
        mask.depth = 1;
        mask.visible = false;
        let removeTilesCount = 0;
        let tileSprites: Phaser.GameObjects.Sprite[][] = [];
        for (let i = 0; i < BH; i++) {
            tileSprites[i] = [];
            for (let j = 0; j < BW; j++) {
                let tile = board[i][j];
                if (tile === BLANK || tile === WALL) {
                    continue;
                }
                let sprite = this.add.sprite(j * TILE_WIDTH + BOARD_WIDTH, i * TILE_HEIGHT + BOARD_HEIGHT, 'tiles', tile - 1);
                sprite.setOrigin(0, 0);
                sprite.setScale(0.4);
                sprite.setInteractive();
                tileSprites[i][j] = sprite;
                sprite.on('pointerdown', () => {
                    if (!mask.visible) {
                        hold = sprite;
                        holdX = j;
                        holdY = i;
                        mask.setPosition(j * TILE_WIDTH + BOARD_WIDTH, i * TILE_HEIGHT + BOARD_HEIGHT);
                        mask.visible = true;
                    } else {
                        if (board[holdY][holdX] === board[i][j] && (holdX !== j || holdY !== i)) {
                            let flag = test(board.flat(), holdY * BW + holdX, i * BW + j);
                            if (flag) {
                                tileSprites[holdY][holdX].visible = false;
                                tileSprites[i][j].visible = false;
                                board[holdY][holdX] = BLANK;
                                board[i][j] = BLANK;
                                removeTilesCount += 2;
                                if (removeTilesCount === TILE_TYPES * 4) {
                                    timer.remove();
                                    let clear = this.add.text(DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2, 'CLEAR', { fontSize: '64px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
                                    let restart = this.add.text(DEFAULT_WIDTH / 2, DEFAULT_HEIGHT / 2 + 100, 'Tap to restart', { fontSize: '16px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
                                    restart.setInteractive();
                                    let name = prompt('クリアしました！ランキングのための名前を入力してください（空欄でもOK）（8文字まで）');
                                    // nameの文字数を8文字に制限
                                    if (name) {
                                        name = name.slice(0, 8);
                                    }
                                    let score = initialTime * 100;
                                    postRanking(name || '名無し', score).then(() => {
                                        this.scene.start('rankingScene');
                                    });
                                }
                            }
                        }
                        mask.visible = false;
                        holdX = -1;
                        holdY = -1;
                    }
                });
            }
        }
    }
}

class RankingScene extends Phaser.Scene {
    constructor() {
        super('rankingScene');
    }
    create() {
        let background = this.add.rectangle(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT, 0x444444, 0.5);
        background.setOrigin(0, 0);
        background.setInteractive();
        getRanking().then((ranking: Ranking[]) => {
            // ランキングを表示
            let rankTitle = this.add.text(DEFAULT_WIDTH / 2, 32, 'ranking', { fontSize: 16, fontFamily: '"font"' }).setOrigin(0.5, 0);
            let y = 64;
            ranking.forEach((r: Ranking, i) => {
                if (i < 10) {

                    y += 32;
                    this.add.text(32, y, (i + 1).toString(), { fontSize: 16, fontFamily: 'monospace' });
                    this.add.text(64, y, r.name, { fontSize: 16, fontFamily: 'monospace' });
                    this.add.text(200, y, r.score.toString(), { fontSize: 16, fontFamily: '"font"' });
                } else if (i == 10) {
                    y = 64;
                    y += 32;
                    this.add.text(32 + DEFAULT_WIDTH / 2, y, (i + 1).toString(), { fontSize: 16, fontFamily: 'monospace' });
                    this.add.text(64 + DEFAULT_WIDTH / 2, y, r.name, { fontSize: 16, fontFamily: 'monospace' });
                    this.add.text(200 + DEFAULT_WIDTH / 2, y, r.score.toString(), { fontSize: 16, fontFamily: '"font"' });
                } else {
                    y += 32;
                    this.add.text(32 + DEFAULT_WIDTH / 2, y, (i + 1).toString(), { fontSize: 16, fontFamily: 'monospace' });
                    this.add.text(64 + DEFAULT_WIDTH / 2, y, r.name, { fontSize: 16, fontFamily: 'monospace' });
                    this.add.text(200 + DEFAULT_WIDTH / 2, y, r.score.toString(), { fontSize: 16, fontFamily: '"font"' });

                }
            });
        })
        let title = this.add.text(DEFAULT_WIDTH / 2, DEFAULT_HEIGHT - 16, 'title', { fontSize: '16px', color: '#fff', fontFamily: '"font"' }).setOrigin(0.5, 1);
        title.setInteractive();
        title.on('pointerdown', () => {
            this.scene.start('titleScene');
        });
    }
}


function Game() {
    const [game, setGame] = useState<GameType>();

    useEffect(() => {
        async function initPhaser() {
            const Phaser = await import('phaser');
            const phaserGame = new Phaser.Game({
                type: Phaser.AUTO,
                width: DEFAULT_WIDTH,// ゲーム画面の横幅
                height: DEFAULT_HEIGHT,// ゲーム画面の高さ
                scale: {
                    parent: 'main',
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                scene: [TitleScene, GameScene, RankingScene],
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0 },
                    }
                },
            });
            setGame(phaserGame);

            return phaserGame;
        }
        initPhaser();
    }, []);
    return (
        <div className="bg-white">
            <div className="py-8 px-4 mx-auto max-w-screen-xllg:px-6">
                <div id="main">
                    { }
                </div>
                <div className="text-center ">
                    <section className="text-left lg:px-16">
                        <h2 className="text-4xl font-bold">四川省</h2>
                        <h3 className=" text-2xl font-bold">概要</h3>
                        <p>麻雀牌を使った二角取りゲーム</p>
                        <h3 className=" text-2xl font-bold">基本ルール</h3>
                        <ul className="list-disc list-inside">
                            <li><strong>牌の除去</strong>：プレイヤーは、同じ種類の牌を二つ選びますが、これらの牌は盤面上で線で結ぶことができる必要があります。この線は他の牌を超えることができず、最大で二つの角を曲がることができます。</li>
                            <li><strong>勝利条件</strong>：盤面のすべての牌を取り除けば勝利です。</li>
                            <li><strong>敗北条件</strong>：動かせる牌がなくなった場合、時間制限に達した場合ゲームオーバーです。</li>
                        </ul>
                        <h3 className=" text-2xl font-bold">素材</h3>
                        <ul className="list-disc list-inside">
                            <li>画像素材：<a href="https://www.civillink.net/fsozai/majan.html" target="_blank">https://www.civillink.net/fsozai/majan.html</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
export default Game;

export const runtime = 'edge';