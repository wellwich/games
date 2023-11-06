'use client'
import { Game as GameType } from "phaser";
import Phaser from "phaser";
import { useState, useEffect } from "react";

const D_WIDTH = 640;
const D_HEIGHT = 480;

class TitleScene extends Phaser.Scene {
    constructor() {
        super('titleScene');
    }
    create() {
        const background = this.add.rectangle(0, 0, D_WIDTH, D_HEIGHT, 0x444444, 0.5);
        background.setOrigin(0, 0);
        background.setInteractive();
        const title = this.add.text(D_WIDTH / 2, D_HEIGHT / 2 - 50, 'ブロック崩し', { fontSize: '64px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
        const start = this.add.text(D_WIDTH / 2, D_HEIGHT / 2 + 100, 'Tap to start', { fontSize: '16px', fontFamily: '"font"' }).setOrigin(0.5, 0.5);
        // 画面のどこかをタップしたらゲーム画面へ
        background.on('pointerup', () => {
            this.scene.start('gameScene');
        });
    }
}

class GameScene extends Phaser.Scene {
    private bricks!: Phaser.Physics.Arcade.StaticGroup;
    private ball!: Phaser.Physics.Arcade.Image;
    private paddle!: Phaser.Physics.Arcade.Image;
    private tiles!: Phaser.Physics.Arcade.StaticGroup;

    constructor() {
        super({
            key: 'gameScene'
        });
    }

    preload() {
        this.load.audio('click', 'https://assets.wellwich.com/default/sounds/click.wav');
    }



    create() {
        const background = this.add.rectangle(0, 0, D_WIDTH, D_HEIGHT, 0x444444, 0.5);
        background.setOrigin(0, 0);
        const hit = this.sound.add('click', { volume: 0.25 });
        this.sound.add('click', { volume: 0.25, rate: 2 });
        this.physics.world.setBoundsCollision(true, true, true, false);

        this.bricks = this.physics.add.staticGroup();
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 5; j++) {
                const brick = this.add.rectangle(64 + i * 64, 64 + j * 32, 48, 16, 0xffffff).setOrigin(0, 0);
                this.bricks.add(brick);
            }
        }

        const ballImage = this.make.graphics({ x: 0, y: 0 });
        ballImage.fillStyle(0xffffff, 1);
        ballImage.fillCircle(8, 8, 8);
        ballImage.generateTexture('ballImage', 16, 16);
        this.ball = this.physics.add.image(D_WIDTH / 2, D_HEIGHT - 50, 'ballImage').setCollideWorldBounds(true).setBounce(1);
        this.ball.setData('onPaddle', true);

        this.physics.add.collider(this.ball, this.tiles, (a, b) => {
            hit.play();
            b.destroy();
        });

        const paddleImage = this.make.graphics({ x: 0, y: 0 });
        paddleImage.fillStyle(0xffffff, 1);
        paddleImage.fillRect(0, 0, 64, 16);
        paddleImage.generateTexture('paddleImage', 64, 16);
        this.paddle = this.physics.add.image(D_WIDTH / 2, D_HEIGHT - 32, 'paddleImage');
        this.paddle.setImmovable();


        this.physics.add.collider(this.ball, this.paddle, () => {
            if (this.ball.getData('onPaddle')) {
                return;
            }
            let diff = 0;
            if (this.ball.x < this.paddle.x) {
                diff = this.paddle.x - this.ball.x;
                this.ball.setVelocityX(-10 * diff);
            }
            else if (this.ball.x > this.paddle.x) {
                diff = this.ball.x - this.paddle.x;
                this.ball.setVelocityX(10 * diff);
            }
            else {
            }
        });
        this.physics.add.collider(this.ball, this.bricks, (a, b) => {
            hit.play();
            b.destroy();
        });

        this.ball.setFriction(0, 0);


        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.paddle.x = pointer.x;
            if (this.ball.getData('onPaddle')) {
                this.ball.x = this.paddle.x;
            }
        }
            , this);

        this.input.on('pointerup', () => {
            if (this.ball.getData('onPaddle')) {
                this.ball.setVelocity(Math.floor(Math.random() * 10) - 5, -300);
                this.ball.setData('onPaddle', false);
            }

        }, this);
    }

    private resetBall() {
        this.ball.setVelocity(0);
        this.ball.setPosition(this.paddle.x, D_HEIGHT - 50);
        this.ball.setData('onPaddle', true);
    }

    update() {
        if (this.ball.y > D_HEIGHT) {
            this.resetBall();
        }
    }
}

function Game() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const [game, setGame] = useState<GameType>();
    const dialogMessages = useState([]);
    const menuItems = useState([]);
    const gameTexts = useState([]);

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
                        <h2 className="text-4xl font-bold">ブロック崩し</h2>
                        <h3 className=" text-2xl font-bold">概要</h3>
                        <p>シンプルなブロック崩し</p>
                        <h3 className=" text-2xl font-bold">基本ルール</h3>
                        <ul className="list-disc list-inside">
                            <li><strong>クリア条件</strong>：ブロックをすべて消したらクリア</li>
                            <li><strong>敗北条件</strong>：ブロックを落としたらゲームオーバー</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
export default Game;

export const runtime = 'edge';