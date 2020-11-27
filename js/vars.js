var vars = {
    DEBUG: true,

    canvas: {
        width: 1920,
        height: 1080,
        cX: 1920/2,
        cY: 1080/2,
    },

    files: {
        batman: {
            images: [
                ['cardBack','images/batmanCardBack.png'],
                ['cardBackAlt','images/batmanCardBackSilver.png'],
            ],
            spritesheets: {
                cards: ['batmanLego','imageSets/batmanLego-ext.png', 200, 260, 1, 2]
            },
            sounds: {
                good: ['batmanYes1.ogg','batmanYes2.ogg','batmanYes3.ogg','batmanYes4.ogg','batmanYes5.ogg'],
                bad:  ['batmanNo1.ogg','batmanNo2.ogg','batmanNo3.ogg','batmanNo4.ogg','batmanNo5.ogg','batmanNo6.ogg','batmanNo7.ogg'],
                win:  'batmanWin.ogg'
            }
        },

        loadAssets: function() {
            switch (vars.imageSets.current) {
                case 'batmanLego': batmanLoader(); break;
            }
        }
    },

    imageSets: {
        available: ['batmanLego'],
        current: 'batmanLego'
    },

    animate: {
        cardsToFound: function(_cardNumber) {
            if (vars.DEBUG===true) { console.log('Spinning the cards to the found area'); }
            let cardA = scene.children.getByName('card_' + _cardNumber + '_a');
            cardA.setDepth(2);
            let cardB = scene.children.getByName('card_' + _cardNumber + '_b');
            cardB.setDepth(1).setTint(0x888888);

            let cV = vars.cards;
            let spinToCol = _cardNumber%3; // col 0, 1 or 2
            let spinToRow = ~~(_cardNumber/3); // row 0, 1 or 2
            let x = cV.spinToOffsets[0] + (spinToCol * (cV.cardWidth/2+60));
            let y = cV.spinToOffsets[1] + (spinToRow * (cV.cardHeight/2+60));

            let rndAngle = Math.random()*0.5*Phaser.Math.RND.sign();
            rndAngle = ~~(rndAngle*1000)/1000;
            rndAngle += Math.PI*3;
            if (vars.DEBUG===true) { console.log('rndAngle: ' + rndAngle); }
            scene.tweens.add({
                targets: cardA,
                x: x,
                y: y,
                scale: 0.5,
                rotation: Math.PI*3+rndAngle,
                ease: 'Cubic.easeOut',
                duration: 3000,
            });
            scene.tweens.add({
                targets: cardB,
                x: x+10,
                y: y+10,
                scale: 0.5,
                rotation: Math.PI*3+rndAngle,
                ease: 'Cubic.easeOut',
                duration: 3000,
            });
        },

        toDefaultState: function() {
            let cV = vars.cards;
            let selected = cV.selected;
            let selectedPair = cV.selectedPair;

            let card1Name = 'card_' + selected[0][0] + '_' + selectedPair[0];
            let back1Name = 'back_' + selected[0][0] + '_' + selectedPair[0];

            let card2Name = 'card_' + selected[1][0] + '_' + selectedPair[1];
            let back2Name = 'back_' + selected[1][0] + '_' + selectedPair[1];

            let card1 = scene.children.getByName(card1Name);
            let back1 = scene.children.getByName(back1Name);
            let card2 = scene.children.getByName(card2Name);
            let back2 = scene.children.getByName(back2Name);

            let duration = vars.cards.spinDuration/2;

            scene.tweens.add({
                targets: [card1,card2],
                delay: duration*2,
                scaleX: 0,
                duration: duration
            })
            scene.tweens.add({
                targets: [back1,back2],
                delay: duration*3,
                scaleX: 1,
                duration: duration
            })
        }
    },

    audio: {
        no: [],
        noUsed: [],
        win: null,
        yes: [],
        yesUsed: [],

        lastSoundCheck: function(__type) {
            if (vars.audio[__type].length===0) {
                if (vars.DEBUG===true) { console.log('This was the last ' + __type + ' sound. Resetting the available sounds array'); }
                vars.audio[__type] = vars.audio[__type + 'Used'];
                vars.audio[__type + 'Used'] = [];
            }
        },

        playSound: function(_type) {
            let aV = vars.audio;
            let audioKey = null;
            if (_type==='yes') {
                // grab a yes sound
                audioKey = aV.yes.splice(0,1);
                aV.yesUsed.push(audioKey);
            } else if (_type==='no') {
                // grab a no sound
                audioKey = aV.no.splice(0,1);
                aV.noUsed.push(audioKey);
            } else if (_type==='win') {
                // play the win sound
                audioKey = 'win';
            }

            if (audioKey!==null) {
                scene.sound.stopAll();
                scene.sound.play(audioKey);
                aV.lastSoundCheck(_type);
            }
        }
    },

    cards: {
        cardArray: [],
        cardPosArray: [],
        cardWidth: 200,
        cardHeight: 260,
        pairsLeft: [9,9],
        spinDuration: 500,
        spinToOffsets: [1450,150],
        selected: [],
        selectedPair: [],

        addCardToSelected: function(_tween,_card) {
            let cV = vars.cards;
            cV.selected.push(_card[0].getData('cardID'));
            cV.selectedPair.push(_card[0].getData('pair'));
            if (cV.selected.length===2) { // 2nd card has been clicked
                vars.cards.checkForPair();
            }
        },

        allFaceDown: function() {
            let first = true;
            let duration = vars.cards.spinDuration/2;
            scene.groups.cardsGroup.children.each( (c)=> {
                let onComplete = null;
                if (first===true) {
                    first = false;
                    onComplete = vars.cards.showCardBacks;
                }
                scene.tweens.add({
                    targets: c,
                    delay: 1750,
                    scaleX: 0,
                    duration: duration,
                    onComplete: onComplete
                })
            })
        },

        checkForPair: function() {
            if (vars.DEBUG===true) { console.log('Checking for pair...'); }
            let cV = vars.cards;
            let aV = vars.audio;
            let gV = vars.game;
            gV.moves++;
    
            // do we have a pair?
            let card1 = cV.selected[0][0]; let card2 = cV.selected[1][0];
            if (card1===card2) { // YES
                // update the found count
                cV.pairsLeft[0]--;
                if (cV.pairsLeft[0]>0) { // do we have pairs still to find?
                    // play yes sound
                    aV.playSound('yes');
                } else { // all pairs found!
                    // play win sound
                    aV.playSound('win');
                    // create the win message
                    let wellDone = scene.add.bitmapText(50, 450, 'batFont', 'Well Done!\n\nYou completed it in\n\n' + gV.moves + ' moves!', 64, 1).setAlpha(0).setName('wellDone');
                    scene.tweens.add({
                        targets: wellDone,
                        delay: 3000, // <== the time for the cards to move to the win position on screen
                        alpha: 1,
                        y: 100,
                        duration: 4000
                    })
                    let playAgain = scene.add.bitmapText(150, 550, 'batFont', '@ Play Again? @', 64, 1).setAlpha(0).setName('playAgain').setTint(0xffff00).setInteractive();
                    scene.tweens.add({
                        targets: playAgain,
                        delay: 7000, // <== the time for the cards to move to the win position on screen
                        alpha: 1,
                        duration: 1000
                    })
                }
                // send the 2 cards to the found group
                if (vars.DEBUG===true) { console.log('Pair found!'); }
                vars.animate.cardsToFound(card1);
            } else { // NO
                // turn the 2 cards back over
                if (vars.DEBUG===true) { console.log('This ISNT a pair :('); }
                // play no sound
                aV.playSound('no');
                vars.animate.toDefaultState();
            }
    
            // next empty out the selected array
            cV.selected=[];
            cV.selectedPair=[];
        },

        showCardBacks: function() {
            // set all backs to visible
            scene.groups.cardBacksGroup.children.each( (c)=> {
                c.setVisible(true);
                let duration = vars.cards.spinDuration/2;
                scene.tweens.add({
                    targets: c,
                    scaleX: 1,
                    duration: duration
                })
            })
        },

        showThisCard: function(_card) {
            if (vars.DEBUG===true) { console.log('Showing This card'); }
            let cardName = _card.name; // this is the back of the card
            cardName = cardName.match(/\w+_([0-9])_([ab])/);
            cardName = 'card_' + cardName[1] + '_' + cardName[2];
            if (vars.DEBUG===true) { console.log('Looking for ' + cardName); }
            let card = scene.children.getByName(cardName);

            let duration = vars.cards.spinDuration/2;

            // we now have the back of the card as "_card" and the front as "card"
            scene.tweens.add({
                targets: _card,
                scaleX: 0,
                duration: duration
            })
            scene.tweens.add({
                targets: card,
                delay: duration,
                scaleX: 1,
                duration: duration,
                onComplete: vars.cards.addCardToSelected,
                onCompleteParams: [ card ]
            })

        }
    },

    game: {
        moves: 0,

        init: function() {
            let cV = vars.cards;
            let xyOffset = 10;
            let xInc = cV.cardWidth+xyOffset;
            let yInc = cV.cardHeight+xyOffset;
            let cardSet = vars.imageSets.current;
            let cardArray = cV.cardArray;
            let cardPosArray = cV.cardPosArray;
            let cCX = cV.cardWidth/2 + 10;
            let cCY = cV.cardHeight/2 + 10;

            for (let c=0; c<9; c++) {
                let index = Phaser.Math.RND.between(0, cardArray.length-1);
                index = cardArray.splice(index,1); // remove the card from the array

                // get 2 positions from the positions array
                let pos1 = Phaser.Math.RND.between(0, cardPosArray.length-1);
                pos1 = cardPosArray.splice(pos1,1);
                if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('Pos1: ' + pos1); }

                let pos2 = Phaser.Math.RND.between(0, cardPosArray.length-1);
                pos2 = cardPosArray.splice(pos2,1);
                if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('Pos2: ' + pos2); }

                // figure out the position on screen for these cards
                let xPos1 = pos1%6;
                let yPos1 = ~~(pos1/6);
                let xPos2 = pos2%6;
                let yPos2 = ~~(pos2/6);

                // place the 2 cards
                // card 1
                let x = xPos1 * xInc + cCX; let y = yPos1 * yInc + cCY;
                let picA = scene.add.sprite(x,y,cardSet,index).setName('card_' + index + '_a');
                picA.setData({ cardID: index, pair: 'a', x: x, y: y, xPos: xPos1, yPos: yPos1 }).setInteractive();
                // back of 1st card pair
                let cardBackA = scene.add.sprite(x,y,'cardBack').setScale(0,1).setVisible(false).setName('back_' + index + '_a').setInteractive();
                // card 2
                x = xPos2 * xInc + cCX; y = yPos2 * yInc + cCY;
                let picB = scene.add.sprite(x,y,cardSet,index).setName('card_' + index + '_b');
                picB.setData({ cardID: index, pair: 'b', x: x, y: y, xPos: xPos2, yPos: yPos2, visible: true }).setInteractive();
                // back of 2nd card pair
                let cardBackB = scene.add.sprite(x,y,'cardBack').setScale(0,1).setVisible(false).setName('back_' + index + '_b').setInteractive();

                scene.groups.cardsGroup.addMultiple([picA,picB]);
                scene.groups.cardBacksGroup.addMultiple([cardBackA,cardBackB]);
            }
        }
    },

    input: {
        enabled: true,

        init: function() {
            scene.input.on('gameobjectdown', function (pointer, card) {
                if (card.name.includes('back')) {
                    vars.cards.showThisCard(card);
                } else if (card.name==='playAgain') {
                    window.location.reload();
                } else if (card.name==='fullScreenButton') {
                    if (scene.scale.isFullscreen) { card.setFrame('fullScreen'); scene.scale.stopFullscreen(); } else { card.setFrame('fullScreen2'); scene.scale.startFullscreen(); }
                } else  {
                    console.log(card);
                }
            });
        }
    }

}