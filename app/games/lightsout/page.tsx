'use client'
import { Game as GameType } from "phaser";
import Phaser from "phaser";
import { useState, useEffect } from "react";

const D_WIDTH = 640;
const D_HEIGHT = 480;

const cellSize = 128;

class TitleScene extends Phaser.Scene {
    constructor() {
        super('titleScene');
    }
    create() {
        const background = this.add.rectangle(0, 0, D_WIDTH, D_HEIGHT, 0x444444, 0.5);
        background.setOrigin(0, 0);
        background.setInteractive();
        const title = this.add.text(D_WIDTH / 2, D_HEIGHT / 2 - 50, 'ライツアウト', { fontSize: '64px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
        const start = this.add.text(D_WIDTH / 2, D_HEIGHT / 2 + 100, 'Tap to start', { fontSize: '16px', fontFamily: '"font"' }).setOrigin(0.5, 0.5);
        // 画面のどこかをタップしたらゲーム画面へ
        background.on('pointerup', () => {
            this.scene.start('gameScene', { limit: 30 });
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }

    private limit!: number;

    init(data: { limit: number }) {
        this.limit = data.limit;
    }

    preload() {
        this.load.image('gauge', 'https://assets.wellwich.com/lightsout/gauge.png');
    }

    create() {
        const background = this.add.rectangle(0, 0, D_WIDTH, D_HEIGHT, 0x444444, 0.5).setOrigin(0, 0);
        const timer = this.time.addEvent({
            delay: 500,
            callback: () => {
                gaugeMask.height += Math.ceil(224 / this.limit);
                if (gaugeMask.height >= 160) {
                    gauge.setFillStyle(0xff0000);
                }
                if (gaugeMask.height >= 224) {
                    timer.remove();
                    const BG = this.add.rectangle(0, 0, D_WIDTH, D_HEIGHT, 0x000000, 0.5).setOrigin(0, 0);
                    BG.setInteractive();
                    const clearText = this.add.text(D_WIDTH / 2, D_HEIGHT / 2, 'GAME OVER', {
                        fontSize: '64px',
                        color: '#ffffff',
                    });
                    clearText.setOrigin(0.5, 0.5);
                    // クリックされたらリロード
                    BG.on('pointerup', () => {
                        this.scene.start('titleScene');
                    });
                }
            },
            repeat: this.limit - 1,
        });
        const gaugeX = 64;
        const gaugeY = 96;
        const levelText = this.add.text(gaugeX - 16, 32, "Lv." + (31 - this.limit).toString().padStart(2, '0'), { fontSize: '32px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0, 0);
        const gauge = this.add.rectangle(gaugeX + 16, gaugeY + 16, 32, 224, 0xffff00).setOrigin(0, 0);
        const gaugeMask = this.add.rectangle(gaugeX + 16, gaugeY + 16, 32, 0, 0x000000).setOrigin(0, 0);
        const guageframe = this.add.image(gaugeX, gaugeY, 'gauge').setOrigin(0, 0);
        // ライツアウトの盤面を作成
        const board = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        // boardの値を0か1にする
        board.forEach((row, y) => {
            row.forEach((cell, x) => {
                board[y][x] = Phaser.Math.Between(0, 1);
            });
        });
        // ライツアウトの盤面を描画
        const whiteCell = this.add.graphics();
        whiteCell.fillStyle(0xffffff);
        whiteCell.fillRect(0, 0, cellSize, cellSize);
        whiteCell.generateTexture('whiteCell', cellSize, cellSize);
        whiteCell.destroy();
        const blackCell = this.add.graphics();
        blackCell.fillStyle(0x000000);
        blackCell.fillRect(0, 0, cellSize, cellSize);
        blackCell.generateTexture('blackCell', cellSize, cellSize);
        blackCell.destroy();

        board.forEach((row, y) => {
            row.forEach((cell, x) => {
                const cellSprite = this.add.sprite(0, 0, cell === 0 ? 'whiteCell' : 'blackCell');
                cellSprite.setOrigin(0, 0);
                cellSprite.setPosition(x * cellSize + 192, y * cellSize + 48);
                cellSprite.setInteractive();
                cellSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                    // クリックされたセルを反転
                    cellSprite.setTexture(cellSprite.texture.key === 'whiteCell' ? 'blackCell' : 'whiteCell');
                    // 上下左右のセルを反転
                    const neighbors = [
                        { x: x - 1, y },
                        { x: x + 1, y },
                        { x, y: y - 1 },
                        { x, y: y + 1 },
                    ];
                    neighbors.forEach(neighbor => {
                        if (neighbor.x >= 0 && neighbor.x < board[0].length && neighbor.y >= 0 && neighbor.y < board.length) {
                            const neighborSprite = this.children.getByName(`${neighbor.x}-${neighbor.y}`) as Phaser.GameObjects.Sprite;
                            neighborSprite.setTexture(neighborSprite.texture.key === 'whiteCell' ? 'blackCell' : 'whiteCell');
                        }
                    });
                    // クリア判定
                    const isClear = board.every((row, y) => {
                        return row.every((cell, x) => {
                            const cellSprite = this.children.getByName(`${x}-${y}`) as Phaser.GameObjects.Sprite;
                            return cellSprite.texture.key === 'whiteCell';
                        });
                    });
                    if (isClear) {
                        const BG = this.add.rectangle(0, 0, D_WIDTH, D_HEIGHT, 0x000000, 0.5).setOrigin(0, 0);
                        BG.setInteractive();
                        const clearText = this.add.text(D_WIDTH / 2, D_HEIGHT / 2, 'CLEAR', {
                            fontSize: '64px',
                            color: '#ffffff',
                        });
                        clearText.setOrigin(0.5, 0.5);
                        // クリックされたらリロード
                        const delay = this.time.addEvent({
                            delay: 1000,
                            callback: () => {
                                this.scene.restart({ limit: this.limit - 1 });
                            },
                        });
                    }
                });
                cellSprite.setName(`${x}-${y}`);
            });
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
                width: D_WIDTH,// ゲーム画面の横幅
                height: D_HEIGHT,// ゲーム画面の高さ
                scale: {
                    parent: 'main',
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                scene: [TitleScene, GameScene],
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
                        <h2 className="text-4xl font-bold">ライツアウト</h2>
                        <h3 className=" text-2xl font-bold">概要</h3>
                        <p>シンプルなライツアウト</p>
                        <h3 className=" text-2xl font-bold">基本ルール</h3>
                        <ul className="list-disc list-inside">
                            <li><strong>クリア条件</strong>：タイルをすべて白にしたらクリア</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
export default Game;

export const runtime = 'edge';