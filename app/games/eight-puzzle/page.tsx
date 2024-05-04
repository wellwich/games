'use client'
import Phaser, { Game as GameType } from "phaser";
import { useState, useEffect } from "react";

const gameConfig = {
    DEFAULT_WIDTH: 1280,
    DEFAULT_HEIGHT: 960,
    DEFAULT_FONT: {
        fontFamily: 'The Strong Gamer',
        fontSize: '128px',
        color: '#ffffff',
    } as Phaser.Types.GameObjects.Text.TextStyle,
    MONO_FONT: {
        fontFamily: 'monospace',
        fontSize: '64px',
        color: '#ffffff',
    } as Phaser.Types.GameObjects.Text.TextStyle,
    CARD_FONT: {
        fontFamily: 'monospace',
        fontSize: '48px',
        color: '#000000',
    } as Phaser.Types.GameObjects.Text.TextStyle,
};



class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }
    create() {
        const background = this.add.rectangle(0, 0, gameConfig.DEFAULT_WIDTH, gameConfig.DEFAULT_HEIGHT, 0x444444, 0.5);
        background.setOrigin(0, 0);
        background.setInteractive();
        const fullScreen = this.add.text(gameConfig.DEFAULT_WIDTH - 16, 16, 'Full Screen', { fontSize: '32px', fontFamily: 'The Strong Gamer' }).setOrigin(1, 0);
        fullScreen.setInteractive();
        fullScreen.on('pointerup', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
        const title = this.add.text(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT / 2 - 50, '8パズル', { fontSize: '96px', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
        const start = this.add.text(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT / 2 + 100, 'Tap to start', { fontSize: '64px', fontFamily: 'The Strong Gamer' }).setOrigin(0.5, 0.5).setFontSize(32);
        // 画面のどこかをタップしたらゲーム画面へ
        background.on('pointerup', () => {
            this.scene.start('GameScene', { level: 1, visibleTime: 3000, missCount: 0 });
        });
        if (window.matchMedia && window.matchMedia('(max-device-width: 640px)').matches) {
            const background = this.add.rectangle(0, 0, gameConfig.DEFAULT_WIDTH, gameConfig.DEFAULT_HEIGHT, 0x444444);
            background.setInteractive();
            background.setOrigin(0, 0);
            this.add.text(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT / 2, '横画面にしてください', gameConfig.DEFAULT_FONT).setFontSize(32).setOrigin(0.5);
            const fixScreen = this.add.text(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT / 2 + 150, '横画面にしたらここをタップ', gameConfig.DEFAULT_FONT).setFontSize(32).setOrigin(0.5);
            fixScreen.setInteractive();
            fixScreen.on('pointerup', () => {
                this.scale.startFullscreen();
                this.scene.start('TitleScene');
            });
        }
    }
}

class GameScene extends Phaser.Scene {
    private tiles!: (Phaser.GameObjects.Image | null)[][];
    private correctTiles!: (Phaser.GameObjects.Image | null)[][];

    private gameWidth = gameConfig.DEFAULT_WIDTH;
    private gameHeight = gameConfig.DEFAULT_HEIGHT;

    private clearCount: number = 0;
    private clearCountText!: Phaser.GameObjects.Text;

    private timer: number = 60;
    private timeText!: Phaser.GameObjects.Text;

    private isShuffling: boolean = false;

    init(data: { clearCount: number, timer: number }) {
        if (data.clearCount) {
            this.clearCount = data.clearCount || 0;
        }
        if (data.timer) {
            this.timer = data.timer || 60;
        }
    }


    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x6666ff);
        graphics.fillRect(0, 0, 200, 200);
        graphics.lineStyle(4, 0x000000);
        graphics.strokeRect(0, 0, 200, 200);

        for (let i = 1; i <= 8; i++) {
            if (this.textures.exists('tile' + i)) {
                continue;
            }

            const number = this.add.text(100, 90, i.toString(), { color: '#000000', fontFamily: gameConfig.DEFAULT_FONT.fontFamily, fontSize: 100 }).setOrigin(0.5);
            const renderTexture = this.add.renderTexture(0, 0, 200, 200);
            renderTexture.draw(graphics);
            renderTexture.draw(number);
            renderTexture.saveTexture('tile' + i);
            renderTexture.destroy();
            number.destroy();
        }

        graphics.destroy();
    }

    create() {


        this.timeText = this.add.text(10, 10, 'Time: ' + this.timer, { color: '#ffffff', fontFamily: gameConfig.DEFAULT_FONT.fontFamily, fontSize: 30 });
        this.timeText.setOrigin(0, 0);
        this.timeText.setScrollFactor(0);
        this.timeText.setDepth(1);
        this.timeText.setInteractive();
        this.timeText.on('pointerdown', () => {
            this.scene.start('GameScene', { clearCount: 0, timer: 60 });
        });

        this.clearCountText = this.add.text(10, 50, 'Clear: ' + this.clearCount, { color: '#ffffff', fontFamily: gameConfig.DEFAULT_FONT.fontFamily, fontSize: 30 });
        this.clearCountText.setOrigin(0, 0);
        this.clearCountText.setScrollFactor(0);
        this.clearCountText.setDepth(1);


        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timer--;
                this.timeText.setText('Time: ' + this.timer);
                if (this.timer <= 0) {
                    this.clearCount = 0; // 追加
                    this.scene.start('GameScene', { clearCount: this.clearCount, timer: 60 });
                }
            },
            loop: true
        });


        const tiles: (Phaser.GameObjects.Image | null)[][] = [];
        const correctTiles: Array<Array<Phaser.GameObjects.Image | null>> = [];
        const offsetX = this.gameWidth / 2 - 200;
        const offsetY = this.gameHeight / 2 - 200;
        for (let i = 0; i < 3; i++) {
            tiles[i] = [];
            correctTiles[i] = [];
            for (let j = 0; j < 3; j++) {

                if (i === 2 && j === 2) {
                    tiles[i].push(null);
                    correctTiles[i].push(null);
                } else {
                    const tile = this.add.image(offsetX + 200 * i, offsetY + 200 * j, 'tile' + (i + j * 3 + 1)).setInteractive().setOrigin(0.5);
                    tiles[i].push(tile);
                    correctTiles[i].push(tile);
                }
            }
        }
        tiles[2][2] = null;
        correctTiles[2][2] = null;
        this.tiles = tiles;
        this.correctTiles = correctTiles;
        this.shuffleTiles();
        this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            const tile = gameObject;
            const x = Math.floor((tile.x - offsetX) / 200);
            const y = Math.floor((tile.y - offsetY) / 200);
            if (this.canMoveTile(x, y)) {
                this.moveTile(x, y);
            }
        });


    }

    moveTile(x: number, y: number) {
        const emptyTile = this.findEmptyTile();
        this.tiles[emptyTile.x][emptyTile.y] = this.tiles[x][y];
        this.tiles[x][y] = null;
        this.tweens.add({
            targets: this.tiles[emptyTile.x][emptyTile.y],
            x: emptyTile.x * 200 + this.gameWidth / 2 - 200,
            y: emptyTile.y * 200 + this.gameHeight / 2 - 200,
            duration: 100,
        });
        this.checkWin();
    }

    canMoveTile(x: number, y: number) {
        const emptyTile = this.findEmptyTile();
        return (x == emptyTile.x && Math.abs(y - emptyTile.y) == 1) || (y == emptyTile.y && Math.abs(x - emptyTile.x) == 1);
    }

    findEmptyTile() {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j] == null) {
                    return { x: i, y: j };
                }
            }
        }
        return { x: -1, y: -1 };
    }

    checkWin() {
        if (this.isShuffling) {
            return;
        }
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                if (this.tiles[i][j] !== this.correctTiles[i][j]) {
                    return;
                }
            }
        }
        this.clearCount++;
        this.scene.start('GameScene', { clearCount: this.clearCount, timer: 60 - this.clearCount });
    }

    shuffleTiles() {
        this.isShuffling = true;
        const directions = [
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
        ];

        for (let i = 0; i < 1000; i++) {
            const emptyTile = this.findEmptyTile();
            const validDirections = directions.filter(direction => this.isValidTile(emptyTile.x + direction.x, emptyTile.y + direction.y));
            if (validDirections.length === 0) {
                break;
            }
            const direction = Phaser.Utils.Array.GetRandom(validDirections);
            this.moveTile(emptyTile.x + direction.x, emptyTile.y + direction.y);
        }
        this.isShuffling = false;
    }

    isValidTile(x: number, y: number) {
        return x >= 0 && x < 3 && y >= 0 && y < 3;
    }

    update(time: number, delta: number) {
    }
}

function Game() {
    const [game, setGame] = useState<GameType>();

    useEffect(() => {
        async function initPhaser() {
            const Phaser = await import('phaser');
            const phaserGame = new Phaser.Game({
                type: Phaser.AUTO,
                width: gameConfig.DEFAULT_WIDTH,// ゲーム画面の横幅
                height: gameConfig.DEFAULT_HEIGHT,// ゲーム画面の高さ
                scale: {
                    parent: 'main',
                    mode: Phaser.Scale.FIT,
                    fullscreenTarget: 'main',
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                },
                scene: [TitleScene, GameScene],
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
                        <h2 className="text-4xl font-bold">8パズル</h2>
                        <h3 className=" text-2xl font-bold">概要</h3>
                        <p>数字をスライドさせて並べ替えるゲームです。</p>
                        <h3 className=" text-2xl font-bold">基本ルール</h3>
                        <ul className="list-disc list-inside">
                            <li><strong>ルール</strong>：数字をスライドさせて並べ替える<br />クリアする毎に1秒減少。</li>
                            <li><strong>操作方法</strong>：数字をタップ</li>
                            <li><strong>制限時間</strong>：60秒</li>
                            <li><strong>クリア条件</strong>：数字を正しく並べ替える</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
export default Game;

export const runtime = 'edge';