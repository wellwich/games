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

class GameScene extends Phaser.Scene {
    constructor() {
        super('gameScene');
    }

    private cards: Phaser.GameObjects.Image[] = [];
    private playerCards: Phaser.GameObjects.Image[] = [];
    private playerCardsPosition: boolean[] = [false, false, false, false, false];
    private trashCards: Phaser.GameObjects.Image[] = [];
    private cardDepth = 0;
    private text!: Phaser.GameObjects.Text;

    preload() {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 13; x++) {
                let suit = '';
                switch (y) {
                    case 0:
                        suit = '♠';
                        break;
                    case 1:
                        suit = '♥';
                        break;
                    case 2:
                        suit = '♦';
                        break;
                    case 3:
                        suit = '♣';
                        break;
                }
                let number = '';
                switch (x) {
                    case 0:
                        number = 'A';
                        break;
                    case 10:
                        number = 'J';
                        break;
                    case 11:
                        number = 'Q';
                        break;
                    case 12:
                        number = 'K';
                        break;
                    default:
                        number = (x + 1).toString();
                        break;
                }
                const cardGraphics = this.add.graphics();
                cardGraphics.fillStyle(0xffffff, 1);
                cardGraphics.fillRect(0, 0, 100, 150);
                const suitText = this.add.text(48, 80, suit, gameConfig.CARD_FONT);
                suitText.setFontSize(64);
                suitText.setOrigin(0.5);
                if (suit === '♦' || suit === '♥') {
                    suitText.setColor('red');
                }
                const numberText = this.add.text(48, 32, number, gameConfig.CARD_FONT);
                numberText.setOrigin(0.5);
                if (suit === '♦' || suit === '♥') {
                    numberText.setColor('red');
                }
                const renderTexture = this.add.renderTexture(0, 0, 100, 150);
                renderTexture.draw(cardGraphics);
                renderTexture.draw(suitText);
                renderTexture.draw(numberText);
                renderTexture.saveTexture('card' + y + x);
                renderTexture.destroy();
                cardGraphics.destroy();
                suitText.destroy();
                numberText.destroy();
            }
        }
        const cardGraphics = this.add.graphics();
        cardGraphics.fillStyle(0xff2222, 1);
        cardGraphics.fillRect(0, 0, 100, 150);
        // カードに文字を表示
        cardGraphics.fillStyle(0x000000, 1);
        cardGraphics.generateTexture('cardBack', 100, 150);
        cardGraphics.destroy();
    }

    create() {
        this.text = this.add.text(gameConfig.DEFAULT_WIDTH / 2, gameConfig.DEFAULT_HEIGHT - 50, 'SHUFFLING', gameConfig.DEFAULT_FONT).setFontSize(32).setOrigin(0.5);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 13; x++) {
                const card = this.add.image(100 * x, 150 * y + 150, 'card' + y + x).setScale(0.8).setOrigin(0, 1);
                card.setData('value', x + y * 13);
                card.setData('isFaceUp', false);
                this.tweens.add({
                    targets: card,
                    x: 6 * 100,
                    y: gameConfig.DEFAULT_HEIGHT / 2 + 100,
                    duration: 1000,
                    ease: 'Power2',
                    yoyo: false,
                    repeat: 0
                });
                this.cards.push(card);
            }
        }
        // cardsの中身をシャッフル
        for (let i = this.cards.length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            const tmp = this.cards[i];
            this.cards[i] = this.cards[r];
            this.cards[r] = tmp;
            // カードの深度を変更
            this.cards[i].setDepth(100 + i);
        }
        this.time.delayedCall(1000, () => {
            const shuffle = this.time.addEvent({
                delay: 10,
                callback: () => {
                    if (this.cards.length > 0) {
                        const card = this.cards[this.cards.length - shuffle.repeatCount - 1];
                        if (card) {
                            card.setData('isFaceUp', true);
                            this.tweens.add({
                                targets: card,
                                x: 100 * Math.floor(shuffle.repeatCount % 13),
                                y: 150 * Math.floor(shuffle.repeatCount / 13) + 200,
                                duration: 1000,
                                ease: 'Power2',
                                yoyo: false,
                                repeat: 0
                            });
                        }
                        if (this.cards.length == 0) {
                            shuffle.remove();
                        }
                    }
                },
                repeat: 51
            });
        });
        this.time.delayedCall(800, () => {
            // カードを裏返す
            this.cards.forEach((card) => {
                this.tweens.add({
                    targets: card,
                    scaleX: 0,
                    duration: 200,
                    onComplete: () => {
                        card.setTexture('cardBack');
                        card.setData('isFaceUp', false);
                        card.setScale(0.8);
                    }
                });
            });
        }
        );
        this.time.delayedCall(3500, () => {
            this.tweens.add({
                targets: this.cards,
                x: 6 * 100,
                y: gameConfig.DEFAULT_HEIGHT / 2 + 100,
                duration: 1000,
                ease: 'Power2',
                yoyo: false,
                repeat: 0,
                onComplete: () => {
                    this.cards.forEach((card) => {
                        card.setInteractive();
                        this.text.setText('SELECT 5 CARDS');
                    });
                }
            });
        }
        );
        this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image) => {
            if (pointer.leftButtonDown()) {
                // playerCardsにgameObjectが含まれていないならば
                if (!this.playerCards?.includes(gameObject) && this.playerCards.length < 5) {
                    this.playerCards.push(gameObject);
                    gameObject.setData('isFaceUp', true);
                    let left = 0;
                    this.playerCardsPosition.some((position, index) => {
                        if (position === false) {
                            this.playerCardsPosition[index] = true;
                            gameObject.setData('position', index);
                            left = index;
                            return true;
                        }
                    });
                    // クリックできないようにする
                    gameObject.disableInteractive();
                    this.tweens.add({
                        targets: gameObject,
                        x: 100 * (left + 1) + 300,
                        y: 800,
                        duration: 1000,
                        onComplete: () => {
                            // カードをめくるアニメーション
                            this.tweens.add({
                                targets: gameObject,
                                scaleX: 0,
                                duration: 200,
                                onComplete: () => {
                                    // カードのテクスチャを変更
                                    gameObject.setTexture('card' + Math.floor(gameObject.getData('value') / 13) + gameObject.getData('value') % 13);
                                    // カードの深度を変更
                                    gameObject.setDepth(this.playerCards.length);
                                    gameObject.setData('isFaceUp', true);
                                    gameObject.setScale(0.8);
                                    gameObject.setInteractive();
                                }
                            });
                        },
                        ease: 'Power2',
                        yoyo: false,
                        repeat: 0
                    });
                } else {
                    if (this.playerCards.includes(gameObject)) {
                        this.playerCards = this.playerCards.filter((card) => {
                            return card != gameObject;
                        });
                        gameObject.disableInteractive();
                        gameObject.setDepth(this.cardDepth++);
                        this.trashCards.push(gameObject);
                        this.playerCardsPosition[gameObject.getData('position')] = false;
                        this.tweens.add({
                            targets: gameObject,
                            x: Math.floor((this.trashCards.length - 1) % 13) * 100,
                            y: 150 + Math.floor((this.trashCards.length - 1) / 13) * 80,
                            duration: 1000,
                            ease: 'Power2',
                            yoyo: false,
                            repeat: 0
                        });
                    }
                }
                // スートの判定
                if (this.playerCards.length == 5) {
                    let isFlush = true;
                    let isStraight = true;
                    let isFourCard = false;
                    let isThreeCard = false;
                    let isPair = false;
                    let suit = Math.floor(this.playerCards[0].getData('value') / 13);
                    let values = this.playerCards.map(card => card.getData('value') % 13).sort();
                    let counts = new Array(13).fill(0);
                    this.playerCards.forEach((card) => {
                        counts[card.getData('value') % 13]++;
                        if (Math.floor(card.getData('value') / 13) != suit) {
                            isFlush = false;
                        }
                    });
                    for (let i = 0; i < 4; i++) {
                        if (values[i + 1] - values[i] != 1) {
                            isStraight = false;
                        }
                    }
                    isFourCard = counts.includes(4);
                    isThreeCard = counts.includes(3);
                    isPair = counts.includes(2);
                    let isStraightFlush = isFlush && isStraight;
                    let isRoyalStraightFlush = isStraightFlush && values[0] == 10;
                    // 結果の表示
                    let textArr = [];
                    if (isFlush) {
                        textArr.push('FLUSH');
                    }
                    if (isStraight) {
                        textArr.push('STRAIGHT');
                    }
                    if (isStraightFlush) {
                        textArr.push('STRAIGHT FLUSH');
                    }
                    if (isRoyalStraightFlush) {
                        textArr.push('ROYAL STRAIGHT FLUSH');
                    }
                    if (isFourCard) {
                        textArr.push('FOUR CARD');
                    }
                    if (isThreeCard) {
                        textArr.push('THREE CARD');
                    }
                    if (isPair) {
                        textArr.push('PAIR');
                    }
                    if (textArr.length == 0) {
                        textArr.push('NO HAND');
                    }
                    this.text.setText(textArr.join(','));
                }
            }
        });
    }

    update(_time: number, _delta: number): void {
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
                scene: [GameScene],
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
                        <h2 className="text-4xl font-bold">ソロポーカー</h2>
                        <h3 className=" text-2xl font-bold">概要</h3>
                        <p>一人用のポーカーです。<br />ポーカーの練習用にでも使ってください。</p>
                        <p>役を作ると画面下に役の名前が出ます。</p>
                        <h3 className=" text-2xl font-bold">基本ルール</h3>
                        <ul className="list-disc list-inside">
                            <li><strong>ルール</strong>：役を作る</li>
                            <li><strong>役</strong>：フラッシュ、ストレート、ストレートフラッシュ、ロイヤルストレートフラッシュ、フォーカード、スリーカード、ワンペア、ノーペア</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
export default Game;

export const runtime = 'edge';