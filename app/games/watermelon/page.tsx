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
        const title = this.add.text(D_WIDTH / 2, D_HEIGHT / 2 - 50, 'ヌイカゲーム', { fontSize: '64px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
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

    preload() {

    }

    private balls!: Phaser.Physics.Matter.Sprite[];
    private flag = false;

    private setColor(ball: Phaser.Physics.Matter.Sprite) {
        // ボールの半径を取得
        const ballRadius = ball.displayWidth; // ボールの半径
        // ボールの色を変更
        let color = 0xffffff;
        switch (ballRadius) {
            case 128:
                color = 0xff00ff;
                break;
            case 96:
                color = 0x00ff00;
                break;
            case 80:
                color = 0xccccff;
                break;
            case 64:
                color = 0xcccccc;
                break;
            case 48:
                color = 0xff0000;
                break;
            case 32:
                color = 0x00ffff;
                break;
            case 16:
                color = 0xffff00;
                break;
        }
        ball.setTint(color);
    }

    private setScore(score: number, ball: Phaser.Physics.Matter.Sprite, scoreText: Phaser.GameObjects.Text) {
        // ボールの半径を取得
        const ballRadius = ball.displayWidth; // ボールの半径
        // スコアを加算。ただし、ボールが大きいほど加算するスコアを大きくする
        const ballScore = (): number => {
            switch (ballRadius) {
                default:
                    return 0;
                case 128:
                    return 28;
                case 96:
                    return 21;
                case 80:
                    return 15;
                case 64:
                    return 10;
                case 48:
                    return 6;
                case 32:
                    return 3;
                case 16:
                    return 1;
            }
        }
        score += ballScore();
        scoreText.setText('SCORE:' + score);
    }

    create() {
        this.flag = false;
        this.balls = [];
        this.add.rectangle(0, 0, D_WIDTH, D_HEIGHT, 0x444444, 0.5).setOrigin(0, 0);
        const gameScreenL = 192;
        const gameScreenR = D_WIDTH - 192;
        const gameScreenH = D_HEIGHT - 192;
        const graphicsGround = this.add.graphics();
        graphicsGround.fillStyle(0x888888);
        graphicsGround.fillRect(0, 0, D_WIDTH, D_HEIGHT);
        graphicsGround.generateTexture('ground', D_WIDTH, D_HEIGHT);
        graphicsGround.destroy();
        const graphicsWall = this.add.graphics();
        graphicsWall.fillStyle(0x888888);
        graphicsWall.fillRect(0, 0, 32, D_HEIGHT);
        graphicsWall.generateTexture('wall', 32, D_HEIGHT);
        graphicsWall.destroy();
        const graphicsBall = this.add.graphics();
        graphicsBall.fillStyle(0xffffff);
        graphicsBall.fillCircle(128, 128, 128);
        // 縁を描画
        graphicsBall.lineStyle(4, 0x000000);
        graphicsBall.strokeCircle(128, 128, 128);
        graphicsBall.generateTexture('ball', 256, 256);
        graphicsBall.destroy();
        const staticGroup = this.matter.world.nextGroup(true);
        // 壁を作成
        const leftWall = this.matter.add.image(gameScreenL, gameScreenH, 'wall', undefined, { isStatic: true, collisionFilter: { group: staticGroup } });
        leftWall.setDisplaySize(32, D_HEIGHT);
        const rightWall = this.matter.add.image(gameScreenR, gameScreenH, 'wall', undefined, { isStatic: true, collisionFilter: { group: staticGroup } });
        rightWall.setDisplaySize(32, D_HEIGHT);
        const ground = this.matter.add.image(D_WIDTH / 2, D_HEIGHT - 16, 'ground', undefined, { isStatic: true, collisionFilter: { group: staticGroup } });
        ground.setDisplaySize(D_WIDTH, 32);
        let score = 0;
        const scoreText = this.add.text(16, 16, "SCORE:" + '0', { fontSize: '32px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0, 0);
        const ballSize = [80, 64, 48, 32, 16];
        // ランダムでボールのサイズを決める
        const ballIndex = Phaser.Math.Between(0, ballSize.length - 1);
        const ballRadius = ballSize[ballIndex];
        // 次のボールのサイズを表示
        const nextBallText = this.add.text(D_WIDTH - 96, 16, "NEXT", { fontSize: '32px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0);
        const nextBall = this.matter.add.sprite(D_WIDTH - 96, 96, 'ball', undefined, { isStatic: true }).setCircle(128);
        nextBall.setDisplaySize(ballRadius, ballRadius);
        nextBall.setName(ballRadius.toString());
        this.setColor(nextBall);
        nextBall.setStatic(true);
        // ballサイズによって色を変える
        // ホールドするボールを作成
        const holdBall = this.matter.add.sprite(D_WIDTH / 2, 32, 'ball', undefined, { isStatic: true }).setCircle(128);
        holdBall.setDisplaySize(nextBall.displayWidth, nextBall.displayHeight);
        holdBall.setTint(nextBall.tintTopLeft);
        holdBall.setName(nextBall.name);
        holdBall.setStatic(true);
        // holdballのあたり判定を解除
        holdBall.setAlpha(0.25);
        holdBall.setCollisionCategory(0);
        const gameoverLine = this.add.rectangle(D_WIDTH / 2, 128, 256, 1, 0xff0000, 0.5).setOrigin(0.5, 0).depth = -1;
        // カーソルの位置にホールドするボールを移動
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            let x = pointer.x;
            // xの範囲を制限
            if (x < gameScreenL + 64) {
                x = gameScreenL + 64;

            }
            if (x > gameScreenR - 64) {
                x = gameScreenR - 64;
            }
            holdBall.setPosition(x, 32);
        });
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => {
            let x = pointer.x;
            // ボールを作成
            // ランダムでボールのサイズを決める
            const ballIndex = Phaser.Math.Between(0, ballSize.length - 1);
            const ballRadius = ballSize[ballIndex];
            // xの範囲を制限
            if (x < gameScreenL + 64) {
                x = gameScreenL + 64;

            }
            if (x > gameScreenR - 64) {
                x = gameScreenR - 64;
            }

            if (!this.flag) {
                let isFalled = false;

                // ホールドと同じサイズのボールを作成
                const ball = this.matter.add.sprite(x, 32, 'ball', undefined, { restitution: 0, friction: 0, frictionAir: 0, density: 0, slop: 1 }).setCircle(128);
                ball.setDisplaySize(holdBall.displayHeight, holdBall.displayHeight);
                ball.setTint(holdBall.tintTopLeft);
                ball.setName(holdBall.name);
                ball.setAlpha(0.25);
                ball.setBounce(0);

                holdBall.setDisplaySize(nextBall.displayWidth, nextBall.displayHeight);
                holdBall.setTint(nextBall.tintTopLeft);
                holdBall.setName(nextBall.name);

                nextBall.setDisplaySize(ballRadius, ballRadius);
                nextBall.setName(ballRadius.toString());
                this.setColor(nextBall);

                this.balls.push(ball);
                // ballがなにかにぶつかったらフラグを立てる
                this.flag = true;
                ball.setOnCollide(() => {
                    if (!isFalled) {
                        isFalled = true;
                        this.flag = false;
                    }
                });
            }
        });
        this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                if (bodyA.gameObject && bodyB.gameObject && bodyA.gameObject.alpha === 0.25 && bodyB.gameObject.alpha === 0.25) {
                    const background = this.add.rectangle(0, 0, D_WIDTH, D_HEIGHT, 0x444444, 0.25);
                    background.setOrigin(0, 0);
                    background.setInteractive();
                    const title = this.add.text(D_WIDTH / 2, D_HEIGHT / 2 - 50, 'GAME OVER', { fontSize: '64px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5, 0.5);
                    const restart = this.add.text(D_WIDTH / 2, D_HEIGHT / 2 + 100, 'Tap to restart', { fontSize: '16px', fontFamily: '"font"' }).setOrigin(0.5, 0.5);
                    // 画面のどこかをタップしたらゲーム画面へ
                    background.on('pointerdown', () => {
                        this.scene.start('gameScene');
                    });
                }
                if (bodyA.gameObject && bodyB.gameObject && bodyA.gameObject.name === bodyB.gameObject.name) {
                    // ボールの半径を取得
                    const ballRadius = parseInt(bodyA.gameObject.name); // ボールの半径
                    const newRadius = ballRadius + 16; // 新しいボールの半径
                    // ボールの大きさを変更
                    bodyA.gameObject.setDisplaySize(newRadius, newRadius);
                    // ボールの色を変更
                    this.setColor(bodyA.gameObject);
                    bodyA.gameObject.setName(newRadius.toString());
                    // スコアを加算。ただし、ボールが大きいほど加算するスコアを大きくする
                    score += ballRadius * 4;

                    scoreText.setText('SCORE:' + score);

                    // this.ballsからbodyBを削除
                    this.balls = this.balls.filter((ball) => {
                        return ball !== bodyB.gameObject;
                    });
                    // ボールを消す
                    bodyB.gameObject.destroy();
                }
            });
        }
        );
        this.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                if (bodyA.gameObject && bodyB.gameObject && bodyA.gameObject.name === bodyB.gameObject.name) {
                    // ボールの半径を取得
                    const ballRadius = parseInt(bodyA.gameObject.name); // ボールの半径
                    const newRadius = ballRadius + 16; // 新しいボールの半径
                    // ボールの大きさを変更
                    bodyA.gameObject.setDisplaySize(newRadius, newRadius);
                    // ボールの色を変更
                    this.setColor(bodyA.gameObject);
                    bodyA.gameObject.setName(newRadius.toString());
                    // スコアを加算。ただし、ボールが大きいほど加算するスコアを大きくする
                    score += ballRadius * 4;

                    scoreText.setText('SCORE:' + score);

                    // this.ballsからbodyBを削除
                    this.balls = this.balls.filter((ball) => {
                        return ball !== bodyB.gameObject;
                    });
                    // ボールを消す
                    bodyB.gameObject.destroy();
                }
            });
        }
        );
    }

    update(time: number, delta: number): void {
        // ボールがy=128より上にある場合はゲームオーバー
        this.balls.forEach((ball) => {
            if (ball.y > 128) {
                ball.setAlpha(1);
            } else {
                ball.setAlpha(0.25);
            }
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
                    default: 'matter',
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
                        <h3 className=" text-2xl font-bold" id="update">更新履歴</h3>
                        <ul className="list-disc list-inside">
                            <li>2023/11/08：リリース</li>
                            <li>2023/11/14：レベルとタイマーを追加</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
export default Game;

export const runtime = 'edge';