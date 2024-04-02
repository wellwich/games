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
        const title = this.add.text(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT / 2 - 50, 'ナンバー＆ダイレクション', { fontSize: '96px', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
        const start = this.add.text(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT / 2 + 100, 'Tap to start', { fontSize: '64px', fontFamily: 'The Strong Gamer' }).setOrigin(0.5, 0.5).setFontSize(32);
        // 画面のどこかをタップしたらゲーム画面へ
        background.on('pointerup', () => {
            this.scene.start('GameScene');
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

interface GameSceneData {
    level: number;
    timerDuration: number;
    visibleTime: number;
    missCount: number;
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    private currentNumber = 1;
    private level = 1;
    private timerDuration = 60000;
    private keys!: { W: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };
    private keysGameObjects!: { W: Phaser.GameObjects.Sprite, S: Phaser.GameObjects.Sprite, A: Phaser.GameObjects.Sprite, D: Phaser.GameObjects.Sprite };
    private isTwinkle = false;
    private visibleTime = 3000;
    private pointerdown: boolean = false;
    private missCount = 0;
    private missCountText!: Phaser.GameObjects.Text;
    private missGameObjects!: Phaser.GameObjects.Sprite;
    private isMiss = false;

    init(data: GameSceneData) {
        this.timerDuration = data.timerDuration || 60000;
        this.level = data.level || 1;
        this.visibleTime = data.visibleTime || 3000;
        this.missCount = data.missCount || 0;
    }

    preload() {
        // 1~25までの数字の配列を作成
        const numbers = Array.from(Array(25).keys()).map(num => num + 1);
        // 背景のグラフィックを作成
        const bgGraphic = this.add.graphics();
        bgGraphic.fillStyle(0xffffff, 1);
        bgGraphic.fillRect(0, 0, 128, 128);
        bgGraphic.lineStyle(2, 0x000000, 1);
        bgGraphic.strokeRect(0, 0, 128, 128);
        // テキストを作成
        numbers.forEach((num, index) => {
            const text = this.add.text(64, 64, `${num}`, {
                fontSize: '64px',
                color: '#000000',
                fontStyle: 'bold',
                fontFamily: gameConfig.MONO_FONT.fontFamily
            }).setOrigin(0.5, 0.5);
            // レンダーテクスチャを作成
            const textureKey = 'numberTile' + `${index + 1}`;
            if (this.textures.exists(textureKey)) {
                this.textures.remove(textureKey);
            }
            const renderTexture = this.add.renderTexture(0, 0, 128, 128);
            renderTexture.draw(bgGraphic);
            renderTexture.draw(text);
            renderTexture.saveTexture('numberTile' + `${index + 1}`);
            renderTexture.destroy();
            text.destroy();
        });
        bgGraphic.destroy();

        const playerGraphic = this.add.graphics();
        playerGraphic.fillStyle(0x0000ff, 1);
        playerGraphic.fillRect(0, 0, 128, 128);
        playerGraphic.lineStyle(2, 0xffffff, 1);
        playerGraphic.strokeRect(0, 0, 128, 128);
        const keyTextUp = this.add.text(64, 64, 'W', {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: gameConfig.MONO_FONT.fontFamily
        }).setOrigin(0.5, 0.5);
        const textureKeyUp = 'keyUp';
        if (this.textures.exists(textureKeyUp)) {
            this.textures.remove(textureKeyUp);
        }
        const renderTextureUp = this.add.renderTexture(0, 0, 128, 128);
        renderTextureUp.draw(playerGraphic);
        renderTextureUp.draw(keyTextUp);
        renderTextureUp.saveTexture('keyUp');
        renderTextureUp.destroy();
        keyTextUp.destroy();

        const keyTextDown = this.add.text(64, 64, 'S', {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: gameConfig.MONO_FONT.fontFamily
        }).setOrigin(0.5, 0.5);
        const textureKeyDown = 'keyDown';
        if (this.textures.exists(textureKeyDown)) {
            this.textures.remove(textureKeyDown);
        }
        const renderTextureDown = this.add.renderTexture(0, 0, 128, 128);
        renderTextureDown.draw(playerGraphic);
        renderTextureDown.draw(keyTextDown);
        renderTextureDown.saveTexture('keyDown');
        renderTextureDown.destroy();
        keyTextDown.destroy();

        const keyTextLeft = this.add.text(64, 64, 'A', {
            fontSize: '64px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: gameConfig.MONO_FONT.fontFamily
        }).setOrigin(0.5, 0.5);
        const textureKeyLeft = 'keyLeft';
        if (this.textures.exists(textureKeyLeft)) {
            this.textures.remove(textureKeyLeft);
        }
        const renderTextureLeft = this.add.renderTexture(0, 0, 128, 128);
        renderTextureLeft.draw(playerGraphic);
        renderTextureLeft.draw(keyTextLeft);
        renderTextureLeft.saveTexture('keyLeft');
        renderTextureLeft.destroy();
        keyTextLeft.destroy();

        const keyTextRight = this.add.text(64, 64, 'D', {
            fontSize: '64px',
            color: '#ffff00',
            fontStyle: 'bold',
            fontFamily: gameConfig.MONO_FONT.fontFamily
        }).setOrigin(0.5, 0.5);
        const textureKeyRight = 'keyRight';
        if (this.textures.exists(textureKeyRight)) {
            this.textures.remove(textureKeyRight);
        }
        const renderTextureRight = this.add.renderTexture(0, 0, 128, 128);
        renderTextureRight.draw(playerGraphic);
        renderTextureRight.draw(keyTextRight);
        renderTextureRight.saveTexture('keyRight');
        renderTextureRight.destroy();
        keyTextRight.destroy();

        playerGraphic.destroy();

        bgGraphic.destroy();

        const bgGraphic2 = this.add.graphics();
        bgGraphic2.fillStyle(0xff0000, 1);
        bgGraphic2.fillRect(0, 0, 128, 128);
        bgGraphic2.lineStyle(2, 0xffffff, 1);
        bgGraphic2.strokeRect(0, 0, 128, 128);
        const missText = this.add.text(64, 64, 'MISS', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: gameConfig.MONO_FONT.fontFamily
        }).setOrigin(0.5, 0.5);
        const textureMiss = 'missTile';
        if (this.textures.exists(textureMiss)) {
            this.textures.remove(textureMiss);
        }
        const renderTextureMiss = this.add.renderTexture(0, 0, 128, 128);
        renderTextureMiss.draw(bgGraphic2);
        renderTextureMiss.draw(missText);
        renderTextureMiss.saveTexture('missTile');
        renderTextureMiss.destroy();
        missText.destroy();
        bgGraphic2.destroy();

    }

    create() {
        this.isTwinkle = false;
        this.pointerdown = false;
        this.isMiss = false;

        // wasdの後ろにgridを作成
        this.add.rectangle(128 + 96, 256 + 256, 128, 128, 0xffffff).setOrigin(0.5);
        this.add.rectangle(128 + 96, 256, 128, 128, 0xffffff).setOrigin(0.5);
        this.add.rectangle(128 + 96 - 128, 256 + 128, 128, 128, 0xffffff).setOrigin(0.5);
        this.add.rectangle(128 + 96 + 128, 256 + 128, 128, 128, 0xffffff).setOrigin(0.5);

        this.missGameObjects = this.add.sprite(128 + 96, 256 + 128, 'missTile').setOrigin(0.5).setVisible(false);

        this.missCountText = this.add.text(0, 0, `MISS: ${this.missCount}/5`, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: gameConfig.MONO_FONT.fontFamily,
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0, 0).setDepth(4);

        // レベルを表示
        this.add.text(gameConfig.DEFAULT_WIDTH / 2, 0, `LEVEL ${this.level}`, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold',
            fontFamily: gameConfig.MONO_FONT.fontFamily,
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5, 0).setDepth(4);

        this.currentNumber = 1;
        const numbers = Array.from(Array(25).keys()).map(num => num + 1);
        // ランダムにシャッフル
        numbers.sort(() => Math.random() - 0.5);
        // 5x5のマス目を作成
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                const number = numbers[i + j * 5];
                const numberTile = this.add.sprite(128 * i + gameConfig.DEFAULT_WIDTH / 2 - 128, 128 * j + 128, 'numberTile' + `${number}`);
                numberTile.setOrigin(0, 0);
                numberTile.setInteractive();
            }
        }
        this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
            const numberTile = gameObject as Phaser.GameObjects.Sprite;
            if (this.currentNumber === parseInt(numberTile.texture.key.replace('numberTile', '')) && this.isTwinkle && !this.isMiss) {
                numberTile.destroy();
                this.currentNumber++;
                if (this.currentNumber === 26) {
                    this.scene.start("GameScene", { level: this.level + 1, visibleTime: this.visibleTime - 100, missCount: this.missCount });
                }
            } else if (this.isTwinkle && !this.isMiss) {
                this.missCount++;
                this.missCountText.setText(`MISS: ${this.missCount}/5`);
                if (this.missCount >= 5) {
                    this.gameover();
                }
            }
        });
        // タイマーゲージを作成
        const timerBar = this.add.graphics();
        timerBar.fillStyle(0x000000, 1);
        timerBar.fillRect(0, 0, 1280, 32);
        timerBar.fillStyle(0xffffff, 1);
        timerBar.fillRect(0, 0, gameConfig.DEFAULT_WIDTH, 32);
        timerBar.setDepth(1);
        this.tweens.add({
            targets: timerBar,
            scaleX: 0,
            duration: this.timerDuration,
            onComplete: () => {
                this.gameover();
            }
        });

        if (this.input.keyboard) {
            this.keys = this.input.keyboard.addKeys('W,S,A,D') as { W: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };
        }

        // keysGameObjectsを作成
        this.keysGameObjects = {
            W: this.add.sprite(128 + 96, 256, 'keyUp').setOrigin(0.5).setVisible(false).setInteractive(),
            S: this.add.sprite(128 + 96, 256 + 256, 'keyDown').setOrigin(0.5).setVisible(false).setInteractive(),
            A: this.add.sprite(128 + 96 - 128, 256 + 128, 'keyLeft').setOrigin(0.5).setVisible(false).setInteractive(),
            D: this.add.sprite(128 + 96 + 128, 256 + 128, 'keyRight').setOrigin(0.5).setVisible(false).setInteractive(),
        };

        // 3秒ごとにキーを一つだけ表示
        this.time.addEvent({
            delay: this.visibleTime,
            callback: () => {
                const keys = ['W', 'S', 'A', 'D'];
                const key = keys[Math.floor(Math.random() * keys.length)];
                const gameObject = (this.keysGameObjects as { [key: string]: Phaser.GameObjects.Sprite })[key];
                gameObject.setVisible(true).setAlpha(1).setScale(1).setInteractive();
                gameObject.on('pointerdown', () => {
                    this.pointerdown = true;
                });
                this.time.addEvent({
                    delay: this.visibleTime - 1000,
                    callback: () => {
                        if (!this.isTwinkle) {
                            gameObject.setVisible(false);
                            this.missCount++;
                            this.missCountText.setText(`MISS: ${this.missCount}/5`);
                            if (this.missCount >= 5) {
                                this.gameover();
                            }
                        }
                    }
                });
            },
            repeat: -1
        });


    }

    gameover() {
        this.add.rectangle(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT / 2, gameConfig.DEFAULT_WIDTH, gameConfig.DEFAULT_HEIGHT, 0x000000, 0.5).setDepth(5);
        this.add.text(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT / 2, "GAME OVER",
            {
                fontSize: '64px',
                color: '#ffffff',
                fontStyle: 'bold',
                fontFamily: gameConfig.MONO_FONT.fontFamily,
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0.5).setDepth(6);
        // タイマーを停止
        this.time.removeAllEvents();
        this.input.once('pointerup', () => {
            this.scene.start("TitleScene", { level: 1, visibleTime: 3000, missCount: 0 });
        });
    }

    update(time: number, delta: number): void {
        // キーが表示されている場合、そのキーを押すと非表示になる
        if (this.keysGameObjects.A.visible && !this.isTwinkle) {
            if (this.keys.A.isDown || this.pointerdown) {
                // tweenで黄色に点滅させる
                this.pointerdown = false;
                this.isTwinkle = true;
                this.tweens.add({
                    targets: this.keysGameObjects.A,
                    scale: { start: 1, to: 0 },
                    duration: this.visibleTime - 1000,
                    repeat: 0,
                    onComplete: () => {
                        this.keysGameObjects.A.setVisible(false);
                        this.isTwinkle = false;
                    },
                });
            } else
                if ((this.keys.W.isDown || this.keys.S.isDown || this.keys.D.isDown || this.input.activePointer.isDown) && !this.isTwinkle) {
                    this.isTwinkle = true;
                    this.isMiss = true;
                    this.missCount++;
                    this.missCountText.setText(`MISS: ${this.missCount}/5`);
                    this.keysGameObjects.A.setVisible(false);
                    this.missGameObjects.setVisible(true);
                    this.tweens.add({
                        targets: this.missGameObjects,
                        scale: { start: 1, to: 0 },
                        duration: this.visibleTime - 1000,
                        repeat: 0,
                        onComplete: () => {
                            this.missGameObjects.setVisible(false);
                            this.isTwinkle = false;
                            this.isMiss = false;
                        },
                    });
                    if (this.missCount >= 5) {
                        this.gameover();
                    }

                }
        }
        if (this.keysGameObjects.D.visible && !this.isTwinkle) {
            if (this.keys.D.isDown || this.pointerdown) {
                this.pointerdown = false;
                this.isTwinkle = true;
                this.tweens.add({
                    targets: this.keysGameObjects.D,
                    scale: { start: 1, to: 0 },
                    duration: this.visibleTime - 1000,
                    repeat: 0,
                    onComplete: () => {
                        this.keysGameObjects.D.setVisible(false);
                        this.isTwinkle = false;
                    },
                });
            } else if ((this.keys.W.isDown || this.keys.S.isDown || this.keys.A.isDown || this.input.activePointer.isDown) && !this.isTwinkle) {
                this.isTwinkle = true;
                this.isMiss = true;
                this.missCount++;
                this.missCountText.setText(`MISS: ${this.missCount}/5`);
                this.keysGameObjects.D.setVisible(false);
                this.missGameObjects.setVisible(true);
                this.tweens.add({
                    targets: this.missGameObjects,
                    scale: { start: 1, to: 0 },
                    duration: this.visibleTime - 1000,
                    repeat: 0,
                    onComplete: () => {
                        this.missGameObjects.setVisible(false);
                        this.isTwinkle = false;
                        this.isMiss = false;
                    },
                });
                if (this.missCount >= 5) {
                    this.gameover();
                }
            }
        }
        if (this.keysGameObjects.W.visible && !this.isTwinkle) {
            if (this.keys.W.isDown || this.pointerdown) {
                this.pointerdown = false;
                this.isTwinkle = true;
                this.tweens.add({
                    targets: this.keysGameObjects.W,
                    scale: { start: 1, to: 0 },
                    duration: this.visibleTime - 1000,
                    repeat: 0,
                    onComplete: () => {
                        this.keysGameObjects.W.setVisible(false);
                        this.isTwinkle = false;
                    },
                });
            } else if ((this.keys.S.isDown || this.keys.A.isDown || this.keys.D.isDown || this.input.activePointer.isDown) && !this.isTwinkle) {
                this.isTwinkle = true;
                this.isMiss = true;
                this.missCount++;
                this.missCountText.setText(`MISS: ${this.missCount}/5`);
                this.keysGameObjects.W.setVisible(false);
                this.missGameObjects.setVisible(true);
                this.tweens.add({
                    targets: this.missGameObjects,
                    scale: { start: 1, to: 0 },
                    duration: this.visibleTime - 1000,
                    repeat: 0,
                    onComplete: () => {
                        this.missGameObjects.setVisible(false);
                        this.isTwinkle = false;
                        this.isMiss = false;
                    },
                });
                if (this.missCount >= 5) {
                    this.gameover();
                }
            }
        }
        if (this.keysGameObjects.S.visible && !this.isTwinkle) {
            if (this.keys.S.isDown || this.pointerdown) {
                this.pointerdown = false;
                this.isTwinkle = true;
                this.tweens.add({
                    targets: this.keysGameObjects.S,
                    scale: { start: 1, to: 0 },
                    duration: this.visibleTime - 1000,
                    repeat: 0,
                    onComplete: () => {
                        this.keysGameObjects.S.setVisible(false);
                        this.isTwinkle = false;
                    },
                });
            } else if ((this.keys.W.isDown || this.keys.A.isDown || this.keys.D.isDown || this.input.activePointer.isDown) && !this.isTwinkle) {
                this.isTwinkle = true;
                this.isMiss = true;
                this.missCount++;
                this.missCountText.setText(`MISS: ${this.missCount}/5`);
                this.keysGameObjects.S.setVisible(false);
                this.missGameObjects.setVisible(true);
                this.tweens.add({
                    targets: this.missGameObjects,
                    scale: { start: 1, to: 0 },
                    duration: this.visibleTime - 1000,
                    repeat: 0,
                    onComplete: () => {
                        this.missGameObjects.setVisible(false);
                        this.isTwinkle = false;
                        this.isMiss = false;
                    },
                });
                if (this.missCount >= 5) {
                    this.gameover();
                }
            }
        }

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
                        <h2 className="text-4xl font-bold">ナンバー＆ダイレクション</h2>
                        <h3 className=" text-2xl font-bold">概要</h3>
                        <p>数字と方向をタッチするゲームです。</p>
                        <h3 className=" text-2xl font-bold">基本ルール</h3>
                        <ul className="list-disc list-inside">
                            <li><strong>ルール</strong>：方向（WASD）を押す（直接でもキーボードでも）と一定時間数字が押せるようになります。<br />制限時間以内に数字を順番に押していってください。</li>
                            <li><strong>制限時間</strong>：1分</li>
                            <li><strong>ミス</strong>：5回まで</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
export default Game;

export const runtime = 'edge';