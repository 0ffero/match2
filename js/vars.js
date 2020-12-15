var vars = {
    DEBUG: false,

    version: 2.0,

    animate: {
        init: function() {
            let selectedSprite = 'coinG';
            let frameNames = Phaser.Utils.Array.NumberArray(1,12,'frame');
            scene.anims.create({ key: selectedSprite, frames: scene.anims.generateFrameNumbers(selectedSprite, { frames: frameNames }), frameRate: 12, repeat: -1 });

            frameNames = Phaser.Utils.Array.NumberArray(1,12,'frame', 's');
            selectedSprite = 'coinS';
            scene.anims.create({ key: selectedSprite, frames: scene.anims.generateFrameNumbers(selectedSprite, { frames: frameNames }), frameRate: 12, repeat: -1 });
        },

        coinsGenerate: function(_coinData) {
            let uiV = vars.UI;
            let sWorth = _coinData.sW; let gWorth = _coinData.gW; let sCoins = _coinData.s; let gCoins = _coinData.g;
            let duration = _coinData.duration; let delay = _coinData.delay;

            let xMin = uiV.coinArea[0]; let xMax = uiV.coinArea[1];
            let dMin = uiV.coinFallDuration[0]; let dMax = duration;
            let fC = frameCount = 12;

            let goldDelay = 0;

            // create the gold coins
            if (gCoins>0) {
                let coin = 'coinG';
                let oC = vars.game.addCoinToScore;

                for (let g=1; g<=gCoins; g++) {
                    //if (vars.DEBUG===true) { console.log('Creating gold coin ' + g + ' of ' + gCoins); }
                    let tDelay = g*16.6667*delay; goldDelay+=16.6667*delay;
                    let tDuration = Phaser.Math.RND.between(dMin,dMax);
                    let scale = Phaser.Math.RND.between(40, 60)/100;
                    let a = scene.add.sprite(Phaser.Math.RND.between(xMin,xMax),-200,coin).setScale(scale).setDepth(5);
                    a.setData('prize', gWorth);
                    scene.groups.coins.add(a);

                    let rev = Phaser.Math.RND.between(0,1) === 1 ? true : false;
                    rev === false ? a.anims.play(coin) : a.anims.playReverse(coin);

                    scene.tweens.add({ targets: a, delay: tDelay, key: { min: 1, max: fC }, ease: 'Quad.easeIn', y: vars.canvas.height+100, duration: tDuration, onComplete: oC })
                }
            }

            // create the silver coins
            if (sCoins>0) { // this check isnt really needed as we always have silver coins
                let coin = 'coinS';
                let oC = vars.game.addCoinToScore;
                let ic=false; let lC = false;

                for (let s=1; s<=sCoins; s++) {
                    //if (vars.DEBUG===true) { console.log('Creating Silver coin ' + s + ' of ' + sCoins); }
                    let tDelay = s*16.67777*delay;
                    let tDuration = Phaser.Math.RND.between(dMin,dMax);
                    let scale = Phaser.Math.RND.between(40, 60)/100;
                    let a = scene.add.sprite(Phaser.Math.RND.between(xMin,xMax),-200,coin).setScale(scale).setDepth(5);
                    if (s===sCoins) { lC = true; tDuration = dMax; }
                    a.setData({ 'prize': sWorth, 'ignoreClear': ic, 'lastCoin': lC });

                    scene.groups.coins.add(a);

                    let rev = Phaser.Math.RND.between(0,1) === 1 ? true : false;
                    rev === false ? a.anims.play(coin) : a.anims.playReverse(coin);

                    scene.tweens.add({ targets: a, delay: tDelay + goldDelay, key: { min: 1, max: fC }, ease: 'Quad.easeIn', y: vars.canvas.height+100, duration: tDuration, onComplete: oC })
                }
            }

            if (vars.DEBUG===true) { console.log('Gold Delay: ' + goldDelay + '. Volume of coins: ' + vars.audio.volumeOfCoins); }

        },

        cardsToFound: function(_cardNumber) {
            if (vars.DEBUG===true) { console.log('Spinning the cards to the found area'); }
            let cardA = scene.children.getByName('card_' + _cardNumber + '_a');
            cardA.setDepth(2);
            let cardB = scene.children.getByName('card_' + _cardNumber + '_b');
            cardB.setDepth(1).setTint(0x888888);

            let cV = vars.cards;
            let cNum = cardA.getData('cNum');
            let spinToCol = cNum%3; // col 0, 1 or 2
            let spinToRow = ~~(cNum/3); // row 0, 1 or 2
            let x = cV.spinToOffsets[0] + (spinToCol * (cV.cardWidth/2+60));
            let y = cV.spinToOffsets[1] + (spinToRow * (cV.cardHeight/2+60)) + 30;

            let rndAngle = Math.random()*0.5*Phaser.Math.RND.sign();
            rndAngle = ~~(rndAngle*1000)/1000;
            rndAngle += Math.PI*3;
            if (vars.DEBUG===true) { console.log('rndAngle: ' + rndAngle); }
            let duration = vars.durations.moveToWinPosition;
            scene.tweens.add({ targets: cardA, x: x, y: y, scale: 0.5, rotation: Math.PI*3+rndAngle, ease: 'Cubic.easeOut', duration: duration });
            scene.tweens.add({ targets: cardB, x: x+10, y: y+10, scale: 0.5, rotation: Math.PI*3+rndAngle, ease: 'Cubic.easeOut', duration: duration });
        },

        toDefaultState: function() {
            let cV = vars.cards;
            let selected = cV.selected;
            let selectedPair = cV.selectedPair;

            let card1Name = 'card_' + selected[0] + '_' + selectedPair[0]; let back1Name = 'back_' + selected[0] + '_' + selectedPair[0];
            let card2Name = 'card_' + selected[1] + '_' + selectedPair[1]; let back2Name = 'back_' + selected[1] + '_' + selectedPair[1];
            let card1 = scene.children.getByName(card1Name); let back1 = scene.children.getByName(back1Name);
            let card2 = scene.children.getByName(card2Name); let back2 = scene.children.getByName(back2Name);
            back1.setData('clicked', undefined); back2.setData('clicked', undefined);

            let duration = vars.durations.turnDuration/2;

            scene.tweens.add({ targets: [card1,card2], delay: duration*3, scaleX: 0, duration: duration })
            scene.tweens.add({ targets: [back1,back2], delay: duration*4, scaleX: 1, duration: duration, onComplete: vars.input.enable })
        },

        unlockCardSpin: function(_card) {
            // set the card to bought
            _card.setData('bought', true);

            // reduce the alpha of all other cards
            let cardName = _card.getData('name');
            scene.groups.upgrades.children.each( (c)=> {
                let cDataName = c.getData('name');
                if (vars.DEBUG===true) { console.log(cDataName + ' - ' + cardName); }
                if (cDataName!==cardName) {
                    if (vars.DEBUG===true) { console.log('Tweening alpha to 0.2'); }
                    scene.tweens.add({ targets: c, alpha: 0.2, duration: 500 })
                } else {
                    if (vars.DEBUG===true) { console.log('Card Found! Leaving alpha at 1'); }
                    c.setDepth(21);
                }
            })

            // tween the bought card
            let finalScale=2;
            let rotations=4;
            let x = vars.canvas.cX; let y = vars.canvas.cY;
            scene.tweens.add({ targets: _card, delay: 250, alpha: 1, x: x, y: y, scale: finalScale, rotation: Math.PI*rotations, duration: 2000, onComplete: vars.UI.hideUnlocked })
        }
    },

    audio: {
        no: [],
        noUsed: [],
        volumeOfCoins: 0.2,
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
                audioKey = aV.yes.splice(0,1); aV.yesUsed.push(audioKey);
            } else if (_type==='no') {
                audioKey = aV.no.splice(0,1); aV.noUsed.push(audioKey);
            } else if (_type==='win') {
                audioKey = 'win';
            }

            if (audioKey!==null) { scene.sound.stopAll(); scene.sound.play(audioKey); aV.lastSoundCheck(_type); }
        },

        playSoundCoin: function() {
            let aVV = vars.audio.volumeOfCoins;
            scene.sound.play('coinAdd', { volume: aVV } );
        }
    },

    cards: {
        cardArray: [],
        cardsUsed: [],
        cardPosArray: [],
        cardWidth: 200,
        cardHeight: 260,
        options: [['cmd_batmanLego','batmanButton'],['cmd_starWarsLego','starWarsButton'], ['cmd_dragonsRR', 'dragonsButton'], ['cmd_toyStory', 'toyStoryButton']],
        pairsLeft: [9,9],
        spinToOffsets: [1450,150],
        selected: [],
        selectedPair: [],
        unlocked: [],
        unlockedStr: '',

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
            let duration = vars.durations.turnDuration/2;
            scene.groups.cardsGroup.children.each( (c)=> {
                let onComplete = null;
                if (first===true) { first = false; onComplete = vars.cards.showCardBacks; }
                scene.tweens.add({ targets: c, delay: 1750, scaleX: 0, duration: duration, onComplete: onComplete })
            })
        },

        buildDefaultArrays: function() {
            vars.cards.cardArray = Phaser.Utils.Array.NumberArray(0,8); // 9 individual cards in each set
            vars.cards.cardPosArray = Phaser.Utils.Array.NumberArray(0,17); // <-- total positions = 18
        },

        checkForPair: function() {
            if (vars.DEBUG===true) { console.log('Checking for pair...'); }
            let cV = vars.cards;
            let aV = vars.audio;
            let gV = vars.game;
            vars.input.disable();
            gV.moves++;

            // do we have a pair?
            let card1 = cV.selected[0]; let card2 = cV.selected[1];
            if (card1===card2) { // YES
                // enable input again
                vars.input.enable();
                // update the found count
                cV.pairsLeft[0]--;
                if (cV.pairsLeft[0]>0) { // do we have pairs still to find?
                    // play yes sound
                    aV.playSound('yes');
                } else { // all pairs found!
                    vars.game.playerWin(gV);
                }
                // send the 2 cards to the found group
                if (vars.DEBUG===true) { console.log('Pair found!'); }
                vars.animate.cardsToFound(card1);

                // spawn 2 gold coins
                let uiV = vars.UI;
                let difficulty = gV.difficulty;
                let coinData = consts[difficulty];
                let useCoin = consts[difficulty].coinForPair;
                let coinCount = coinData.pairWorth/coinData['coinWorth' + useCoin];
                for (b=1; b<=coinCount; b++) {
                    let oC = vars.game.addCoinToScore;

                    let x = Phaser.Math.RND.between(uiV.coinArea[0],uiV.coinArea[1]);
                    let s = scene.add.sprite(x,-200,'coin' + useCoin).setScale(0.7).setDepth(3);
                    s.anims.play('coin' + useCoin);
                    scene.groups.coins.add(s);
                    if (cV.pairsLeft[0]===0) { s.setData('ignoreClear', true); }
                    if (b===2) { s.setData('lastCoin', true); } else { s.setData('lastCoin', false); }
                    let prize = consts[gV.difficulty]['coinWorth' + useCoin];
                    s.setData('prize', prize);
                    let delay = (b-1) * 16.667 * 30;
                    scene.tweens.add({ targets: s, delay: delay, key: { min: 1, max: 12 }, ease: 'Quad.easeIn', y: vars.canvas.height+100, duration: 1000, onComplete: oC })
                }
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

        createDeck: function() {
            // get the current unlocked cards
            let cV = vars.cards;
            let avail =  Phaser.Utils.Array.NumberArray(0,8);
            let cDeck = vars.imageSets.currentFName;
            for (let c of cV.unlocked) {
                if (c[0].includes(cDeck)) {
                    avail.push(parseInt(c[1]));
                }
            }
            return shuffle(avail).slice(0,9);
        },

        drawCards: function() {
            vars.game.drawCards();
        },

        getCardCost: function() {
            return consts[vars.game.difficulty].cardCost;
        },

        showCardBacks: function() {
            // set all backs to visible
            scene.groups.cardBacksGroup.children.each( (c)=> {
                c.setVisible(true);
                let duration = vars.durations.turnDuration/2;
                scene.tweens.add({ targets: c, scaleX: 1, duration: duration })
            })
        },

        showThisCard: function(_card) {
            if (vars.input.enabled===false) { return false; }
            if (vars.DEBUG===true) { console.log('Showing This card'); }
            let cardName = _card.name; // this is the back of the card
            cardName = cardName.match(/\w+_([0-9]{1,2})_([ab])/);

            // check that this isnt the same card as the first (ie accidental double click)
            if (_card.getData('clicked')===undefined) { _card.setData('clicked', true); } else { return false; }

            cardName = 'card_' + cardName[1] + '_' + cardName[2];
            if (vars.DEBUG===true) { console.log('Looking for ' + cardName); }
            let card = scene.children.getByName(cardName);

            let duration = vars.durations.turnDuration/2;

            scene.sound.play('cardTurn');

            // we now have the back of the card as "_card" and the front as "card"
            scene.tweens.add({ targets: _card, scaleX: 0, duration: duration })
            scene.tweens.add({ targets: card, delay: duration, scaleX: 1, duration: duration, onComplete: vars.cards.addCardToSelected, onCompleteParams: [ card ] })
        },

        unlock: function(_cardID, _cardName) {
            if (vars.DEBUG===true) { console.log('Card ID: ' + _cardID + '. Card Name: ' + _cardName); }
            scene.sound.play('unlock');
            let cV = vars.cards;
            let gV = vars.game;

            // reduce the players "score" (coins) by the cost of a card
            let cardCost = vars.cards.getCardCost();
            gV.score-=cardCost;
            vars.UI.pointsChange(gV.score);

            // add the unlocked card to the cards var
            cV.unlocked.push([_cardName, _cardID]);

            // save to the unlocked var
            vars.localStorage.saveUnlockedCard(_cardName, _cardID);
            vars.localStorage.saveScore(gV.score);
        },

        unlockedToStr: function() {
            let cV = vars.cards;
            let uArray = cV.unlocked;
            if (uArray.length>0) {
                for (u of uArray) { cV.unlockedStr+=u[0] + ','; }
                cV.unlockedStr=cV.unlockedStr.slice(0,-1);
            }
        }
    },

    game: {
        difficulty: 'veryEasy',
        difficultyOptions: ['veryEasy','easy', 'normal', 'hard'],
        firstGame: true, // this is a soft variable. If the player has just booted up the game theyll receive extra coins after completing the first game.
        moves: 0,
        score: -1,
        bestScore: -1,
        bgColour: '2,0',

        addCoinToScore: function(_tween, _object, _score) {
            let gV = vars.game;
            if (_score!==null && _score!==undefined) { gV.score += _score; }
            if (_object!==undefined) { gV.score += parseInt(_object[0].getData('prize')); }
            vars.audio.playSoundCoin();

            // the last coin cleans up the coins group
            if (_object!==undefined && _object[0].getData('lastCoin')===true && _object[0].getData('ignoreClear')===false) { vars.groups.empty('coins'); }

            // update the ui to show new total
            vars.UI.pointsChange(gV.score);

            // save new score
            vars.localStorage.saveScore(gV.score);
        },

        checkPlayerCoins: function() {
            if (vars.game.score>=vars.cards.getCardCost()) {
                // the player still has enough coins to unlock another card. Fade the other cards back in
                scene.groups.upgrades.children.each( (c)=> { if (c.getData('bought')!==true) { scene.tweens.add({ targets: c, delay: 0, alpha: 1, duration: 500, }) } })
                // update the header
            } else {
                // player doesnt have enough to unlock another card. Hide the unlock screen
                vars.UI.hideUpgrades();
            }
        },

        difficultyChange: function(_card) {
            let cName = _card.name.replace('dif_','');
            let gV = vars.game;
            if (gV.difficulty!==cName) {
                gV.difficulty = cName;
                vars.localStorage.saveDifficulty();
                vars.game.reset();
            } else { // player has selected the current difficulty, hide the options screen, nothing else needs done
                vars.UI.optionsHide();
            }
        },

        drawCards: function() {
            let gV = vars.game;
            let cV = vars.cards;

            gV.moves=0;
            let xyOffset = 20; let xInc = cV.cardWidth+xyOffset; let yInc = cV.cardHeight+xyOffset; let yPush = 70;
            let cardSet = vars.imageSets.current;
            //let cardArray = cV.cardArray;
            let cardPosArray = cV.cardPosArray;
            let cCX = cV.cardWidth/2 + 10; let cCY = cV.cardHeight/2 + 10;
            let difficulty = gV.difficulty;
            let cardBacks = consts[difficulty].cardBacks;

            if (scene.children.getByName('gameBG')===null) { 
                let tint = vars.UI.getBGColour();
                scene.add.image(vars.canvas.cX, vars.canvas.cY, 'background').setName('gameBG').setTint(tint); 
            }

            let cardDeck = vars.cards.createDeck();

            for (let c=0; c<9; c++) {
                let index = cardDeck[0];
                index = cardDeck.splice(0,1)[0];
                // convert index to letter
                let cardLetter=-1
                if (index>=9) {
                    if (index===9) { cardLetter = '9'; } else { cardLetter = String.fromCharCode((index-10)+65); }
                } else {
                    cardLetter = index.toString();
                }

                // get 2 positions from the positions array
                let pos1 = Phaser.Math.RND.between(0, cardPosArray.length-1);
                pos1 = cardPosArray.splice(pos1,1);
                if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('Pos1: ' + pos1); }

                let pos2 = Phaser.Math.RND.between(0, cardPosArray.length-1);
                pos2 = cardPosArray.splice(pos2,1);
                if (vars.DEBUG===true && vars.VERBOSE===true) { console.log('Pos2: ' + pos2); }

                // figure out the position on screen for these cards
                let xPos1 = pos1%6; let yPos1 = ~~(pos1/6);
                let xPos2 = pos2%6; let yPos2 = ~~(pos2/6);

                // place the 2 cards
                // card 1
                let x = xPos1 * xInc + cCX; let y = yPos1 * yInc + cCY; y+=yPush;
                let picA = scene.add.sprite(x,y,cardSet,'card' + cardLetter).setName('card_' + index + '_a');
                picA.setData({ cardID: index, cNum: c, pair: 'a', x: x, y: y, xPos: xPos1, yPos: yPos1 }).setInteractive();
                // back of 1st card pair
                let cardBackA = scene.add.sprite(x,y,cardBacks[0]).setScale(0,1).setVisible(false).setName('back_' + index + '_a').setInteractive();
                // card 2
                x = xPos2 * xInc + cCX; y = yPos2 * yInc + cCY; y+=yPush;
                let picB = scene.add.sprite(x,y,cardSet,'card' + cardLetter).setName('card_' + index + '_b');
                picB.setData({ cardID: index, cNum: c, pair: 'b', x: x, y: y, xPos: xPos2, yPos: yPos2, visible: true }).setInteractive();
                // back of 2nd card pair
                let cardBackB = scene.add.sprite(x,y,cardBacks[1]).setScale(0,1).setVisible(false).setName('back_' + index + '_b').setInteractive();

                scene.groups.cardsGroup.addMultiple([picA,picB]);
                scene.groups.cardBacksGroup.addMultiple([cardBackA,cardBackB]);
            }
        },

        getScore: function() {
            consts.convertMovesToPrize();
        },

        playerWin: function(_gV) {
            vars.game.getScore();
            vars.emitters.create();
            vars.localStorage.checkForBestScore();
            // play win sound
            vars.audio.playSound('win');
            // create the win message
            let wellDone=null;
            let playAgain = null;
            let iC = vars.imageSets.current;
            if (iC==='batmanLego') {
                wellDone = scene.add.bitmapText(50, 450, 'batFont', 'Well Done!\n\nYou completed it in\n\n' + _gV.moves + ' moves!', 64, 1).setAlpha(0).setName('wellDone');
                playAgain = scene.add.bitmapText(150, 550, 'batFont', '@ Play Again? @', 64, 1).setAlpha(0).setName('playAgain').setTint(0xffff00).setInteractive();
            } else if (iC==='starWarsLego') {
                wellDone = scene.add.bitmapText(110, 450, 'starFont', 'Well Done!\nYou completed it in\n' + _gV.moves + ' moves!', 142, 1).setAlpha(0).setName('wellDone');
                playAgain = scene.add.bitmapText(150, 550, 'starFont', '@ Play Again? @', 142, 1).setAlpha(0).setName('playAgain').setTint(0xffff00).setInteractive();
            } else if (iC==='dragonsRR') {
                wellDone = scene.add.bitmapText(110, 450, 'dragonFont', 'Well Done!\nYou completed it in\n' + _gV.moves + ' moves!', 142, 1).setAlpha(0).setName('wellDone').setScale(1.25,1);
                playAgain = scene.add.bitmapText(250, 550, 'dragonFont', 'Play Again', 142, 1).setAlpha(0).setName('playAgain').setTint(0xffff00).setInteractive().setScale(1.73,1);
            } else if (iC==='toyStory') {
                wellDone = scene.add.bitmapText(110, 450, 'toyStoryFont', 'Well Done!\nYou completed it in\n' + _gV.moves + ' moves!', 82, 1).setAlpha(0).setName('wellDone').setScale(1.25,1);
                playAgain = scene.add.bitmapText(250, 550, 'toyStoryFont', 'Play Again', 76, 1).setAlpha(0).setName('playAgain').setInteractive().setScale(1.73,1);
            } else {
                console.error('** The wellDone and playAgaint wasnt been set up! **')
            }

            // show the well done message
            let dV = vars.durations;
            scene.tweens.add({ targets: wellDone, delay: dV.moveToWinPosition/2, alpha: 1, y: 100, duration: dV.wellDone })

            // show the play again button
            scene.tweens.add({ targets: playAgain, delay: dV.wellDone + dV.moveToWinPosition/2, alpha: 1, duration: dV.playAgain })
        },

        reset: function() {
            scene.registry.destroy(); scene.events.off(); vars.game.restart(); scene.scene.restart();
        },

        restart: function() {
            // CLEAN UP
            // re initialise all the variables
            let cV = vars.cards;
            cV.pairsLeft[0]=cV.pairsLeft[1];
            vars.game.moves=0;
            vars.cards.buildDefaultArrays();

            // empty out the groups
            let groups = scene.groups;
            groups.cardsGroup.children.each( (c)=> { c.destroy(); }); groups.cardsGroup.clear();
            groups.cardBacksGroup.children.each( (c)=> { c.destroy(); }); groups.cardBacksGroup.clear();

            // remove well done and play again
            let wD = scene.children.getByName('wellDone'); // note: if well done is visible, play again will be too. This just allows us to restart mid game
            if (wD!==null) { scene.children.getByName('wellDone').destroy(); scene.children.getByName('playAgain').destroy(); }

            // Remove fireworks
            if (scene.children.getByName('fw_0')) {
                vars.emitters.destroy();
            }

            // START THE GAME
            vars.game.drawCards();
            vars.cards.allFaceDown();
        },

        updateScore: function() {

        }
    },

    input: {
        enabled: true,

        disable: function() {
            if (vars.input.enabled===true) {
                vars.input.enabled=false;
            }
        },

        enable: function() {
            if (vars.input.enabled===false) {
                vars.input.enabled=true;
            }
        },

        init: function() {
            scene.input.on('gameobjectdown', function (pointer, card) {
                let gV = vars.game;
                let cV = vars.cards;
                if (card.name.includes('back')) {
                    if (vars.input.enabled===false) { return false; }
                    cV.showThisCard(card);
                } else if (card.name==='playAgain') {
                    gV.restart();
                } else if (card.name==='fullScreenButton') {
                    if (scene.scale.isFullscreen) { card.setFrame('fullScreen'); scene.scale.stopFullscreen(); } else { card.setFrame('fullScreen2'); scene.scale.startFullscreen(); }
                } else if (card.name==='restartButton') {
                    if (vars.input.enabled===false) { return false; }
                    gV.restart();
                } else if (card.name==='optionsButton') {
                    if (vars.input.enabled===false) { return false; }
                    vars.UI.showOptions();
                } else if (card.name.includes('bgC_')===true) { 
                    vars.UI.changeBackground(card.name.replace('bgC_','').split('_'));
                } else if (card.name==='cmd_batmanLego' || card.name==='cmd_starWarsLego' || card.name==='cmd_dragonsRR' || card.name==='cmd_toyStory') {
                    let reset = vars.localStorage.updateCardSet(card.name.replace('cmd_',''));
                    if (reset===false) { vars.UI.optionsHide(); }
                } else if (card.name.includes('dif_')) {
                    gV.difficultyChange(card);
                } else if (card.name==='pointsText') {
                    if (gV.score>=cV.getCardCost()) { vars.UI.showUpgrades(vars.imageSets.current); }
                } else if (card.name==='unlockable') {
                    let cardID = card.getData('cID');
                    let cardName = card.getData('name');
                    cV.unlock(cardID,cardName);
                    vars.animate.unlockCardSpin(card);
                } else if (card.name === 'ulClose') {
                    vars.UI.hideUpgrades();
                } else {
                    if (vars.DEBUG===true) { console.log(card); }
                }
            });
        }
    },

    player: {
        bonusAwarded: false,
        name: 'friend'
    },

    UI: {

        backgroundColour: -1,
        coinArea: [1400,1800],
        coinFallDuration: [1000,2000],

        init: function() {
            // Options
            scene.add.image(vars.canvas.cX, vars.canvas.cY, 'whitePixel').setTint(vars.UI.getBGColour()).setScale(vars.canvas.width, vars.canvas.height).setName('optionsBG').setAlpha(0.99).setVisible(false);

            // Background Colours
            let x = 1340; let xInc=180; let realX=x;
            let y=200; let yInc=180;
            let m=0;

            let bGTitle = scene.add.bitmapText(1270, 20, 'default', 'Backgrounds', 64, 1).setTint(0x0092DC).setName('bGTitle').setVisible(false).setDepth(11);
            scene.groups.bgOptions.add(bGTitle);
            for (s of vars.colours.backgrounds) {
                let l=0;
                for (c of s) {
                    realX=x+(l*xInc);
                    let a = scene.add.image(realX,y,'bgColour').setTint(c[0]).setName('bgC_' + m + '_' + l).setVisible(false).setInteractive().setDepth(11);
                    scene.groups.bgOptions.add(a);
                    l++;
                }
                m++; y+=yInc; realX=x;
            }

            // Card Set options
            scene.add.bitmapText(190, 20, 'default', 'Select a card set...', 72, 1).setTint(0x0092DC).setName('optionsTitle').setVisible(false);
            // Full Screen Icon
            scene.add.image(1840,1000, 'fullScreenButton').setName('fullScreenButton').setData('fullScreen','false').setInteractive();
            // Options Icon
            scene.add.image(1430,1000,'optionsButton').setName('optionsButton').setInteractive();
            // Restart Icon
            scene.add.image(1640,1000, 'restartButton').setName('restartButton').setInteractive();

            vars.UI.difficultyOptions();

            // Show the Welcome message
            let iSV = vars.imageSets;
            let files = vars.files[iSV.currentFName];
            let fontName = files.font[0];
            let welcomeMsg = 'Welcome to Match 2, Caleb' + files.paragraph + files.editionText;
            let wD = files.welcomeData;
            scene.add.bitmapText(wD[0], wD[1], fontName, welcomeMsg, wD[2], wD[3]).setScale(wD[4],wD[5]).setName('welcomeText');

            // show the players current "points"
            let data = {
                batmanLego: { fontSize: 40, scale: [1,1.4], xy: [15, 5] },
                dragonsRR: { fontSize: 80, scale: [1.7,1], xy: [15, 5] },
                starWarsLego: { fontSize: 100, scale: [0.9,1], xy: [15, -20] },
                toyStory: { fontSize: 72, scale: [0.9,0.85], xy: [15, -10] }
            }
            
            let points = vars.game.score;
            let imageSetName = iSV.current;
            let fontData = data[imageSetName];
            let tint = consts.getTint(points);
            let unlockText = vars.UI.setUnlockText();
            let pointsText = scene.add.bitmapText(fontData.xy[0], fontData.xy[1], fontName, 'Points: ' + points + unlockText, fontData.fontSize).setTint(tint).setName('pointsText').setScale(fontData.scale[0],fontData.scale[1]);
            if (unlockText.length>0) { 
                pointsText.setInteractive();
            }
            
        },

        askForName: function() {
            let nameForm = scene.add.dom(vars.canvas.cX, vars.canvas.cY).createFromCache('nameform').setAlpha(0).setName('nameForm');
            nameForm.addListener('click');
            nameForm.getChildByName('cmd_name').select();
            nameForm.on('click', function (event) {
                if (event.target.name === 'playButton') {
                    var username = this.getChildByName('cmd_name');
                    this.removeListener('click');
                    this.setVisible(false);
                    vars.player.name = username.value;
                }
            });

            // fade in form
            scene.tweens.add({
                targets: nameForm,
                alpha: 1,
                duration: 3000,
                ease: 'Power3'
            });
        },

        changeBackground: function(_selected) {
            let s = parseInt(_selected[0]); let c = parseInt(_selected[1]); // better safe than sorry
            let tint = vars.colours.backgrounds[s][c];
            if (vars.DEBUG===true) { console.log(_selected + ', tint: ' + tint + '('+ s + ',' + c + ')'); }
            
            // set the actual tint
            scene.children.getByName('gameBG').setTint(tint[0]);

            // update the vars
            vars.game.bgColour = s + ',' + c;
            vars.localStorage.updateBGColour();

            // hide the options
            vars.UI.optionsHide();
        },

        destroyUnlockedCard: function(_tween, _card) {
            _card[0].destroy();
            vars.game.checkPlayerCoins();
        },

        difficultyOptions: function() {
            let gV = vars.game;
            let difList = gV.difficultyOptions;
            let x = 1340; let y = 785;

            let difTitle = scene.add.bitmapText(x+20, y-100,'default','Difficulty',58).setTint(0x0092DC).setName('diftitle').setDepth(12).setVisible(false);
            scene.groups.bgOptions.add(difTitle);
            let c = 0;
            for (let d of difList) {
                c++;
                let frame=1;
                if (d===gV.difficulty) { frame=0; }
                let a = scene.add.image(x, y+40, 'difficultyButtons', frame).setDepth(11).setName('dif_' + d).setVisible(false).setInteractive();
                let difficulty = d.capitalise();
                if (d==='veryEasy') { difficulty='Very Easy'; }
                let b = scene.add.bitmapText(x-150,y+15,'default',difficulty,42).setDepth(12).setName('dif_' + d).setVisible(false).setInteractive();
                scene.groups.bgOptions.addMultiple([a,b]);
                if (c%2===0) { y+=95; x-=360; } else { x+=360; }
            }
        },

        getBGColour: function() {
            let uV = vars.UI;
            if (vars.UI.backgroundColour===-1) {
                let colour = vars.game.bgColour.split(',');
                let rColour = vars.colours.backgrounds[colour[0]][colour[1]];
                uV.backgroundColour = rColour;
                return rColour;
            } else {
                return uV.backgroundColour;
            }
        },

        hideUnlocked: function(_tween, _object) {
            let card = _object[0];
            scene.tweens.add({ targets: card, delay: 2000, alpha: 0, duration: 2000, onComplete: vars.UI.destroyUnlockedCard })
        },

        hideUpgrades: function() {
            // delete everything in the upgrades group
            scene.groups.upgrades.children.each( (c)=> {
                c.destroy();
            })
            // get rid of the background
            scene.children.getByName('optionsBG').setVisible(false).setDepth(10);

            // allow user to click on things again
            vars.input.enable();
        },

        optionsHide: function() {
            for (let c of vars.cards.options) { scene.children.getByName(c[0]).destroy(); }
            scene.children.getByName('optionsBG').setVisible(false);
            scene.children.getByName('optionsTitle').setVisible(false);
            scene.groups.bgOptions.children.each( (c)=> { c.setVisible(false); })
        },

        pointsChange: function(_score) {
            if (Number.isInteger(_score)===true) {
                let tint = consts.getTint(_score);
                let unlockText = vars.UI.setUnlockText();
                let pointsText = scene.children.getByName('pointsText').setText('Points: ' + _score + unlockText).setTint(tint);
                if (scene.children.getByName('ulHeader')!==null) { vars.UI.showUpgradesHeader(); }
                if (unlockText.length>0) { pointsText.setInteractive(); } else { pointsText.disableInteractive(); }
            }
        },

        setUnlockText: function() {
            let msg = '';
            let points = vars.game.score;
            let cardCost = vars.cards.getCardCost();

            if (points>=cardCost) {
                let unlocks = ~~(points/cardCost);
                let multi = 's'; if (unlocks===1) { multi=''; }
                msg = ' (you can unlock ' + unlocks + ' card' + multi + ')';
                if (scene.children.getByName('ulHeader'!==null)) { vars.UI.showUpgradesHeader(true); }
            }

            return msg;
        },

        showOptions: function() {
            let UIDepth = 10;
            scene.children.getByName('optionsBG').setVisible(true).setDepth(UIDepth);
            scene.children.getByName('optionsTitle').setVisible(true).setDepth(UIDepth);
            scene.groups.bgOptions.children.each( (c)=> { c.setVisible(true); })
            let cV = vars.cards;
            let gameTypes=[];
            let xSpacing = [[],[],[-200,200],[-300,0,300]];
            // with these we can deal with anything up to 10 different card sets
            // The order (3,5,2,7) is important. It allows groups of 3 and 5 to be created before groups of 2
            if (cV.options.length%3===0) { // 3 6 or 9 games
                if (vars.DEBUG===true) { console.log('3\'s'); }
                gameTypes.push(3);
            } else if (cV.options.length%5===0) { // 5, a special case of a 2 followed by a 3
                if (vars.DEBUG===true) { console.log('5\'s'); }
                gameTypes.push([2,3]);
            } else if (cV.options.length%2===0) {
                if (vars.DEBUG===true) { console.log('2\'s'); }
                gameTypes.push(2);
            } else if (cV.options.length%7===0) { // 7, another special case of 2,3,2
                if (vars.DEBUG===true) { console.log('7\'s'); }
                gameTypes.push([2,3,2]);
            }

            let dupeCount = cV.options.length/2;
            if (dupeCount>1) {
                for (let d=1; d<dupeCount; d++) {
                    gameTypes.push(gameTypes[0]);
                }
            }
            let x = 550; let y = 200; let o=0; let logos = [];
            for (gT of gameTypes) {
                if (vars.DEBUG===true) { console.log('gT is ' + gT); }
                for (let xPos=0; xPos<gT; xPos++) {
                    let xOffset = xSpacing[gT][xPos]; let actualX = x+xOffset;
                    if (vars.DEBUG===true) { console.log('xOffset: ' + xOffset + '. Actual x: ' + actualX + '. y: ' + y); }
                    let buttonName = vars.cards.options[o][0]; let spriteName = vars.cards.options[o][1];
                    let a = scene.add.image(actualX, y, 'gameButtons', spriteName).setDepth(UIDepth).setName(buttonName).setInteractive();
                    logos.push(a);
                    o++;
                }
                y+=200; 
            }

            scene.tweens.add({ targets: logos, scale: 0.9, duration: 3000, yoyo: true, ease: 'Bounce', repeat: -1 })
        },

        showUpgrades: function(_upgradeFor) {
            if (_upgradeFor!=='batmanLego' && _upgradeFor!=='starWarsLego' && _upgradeFor!=='dragonsRR' && _upgradeFor!=='toyStory') {
                console.error(_upgradeFor + ' is invalid!');
                return false;
            }
            vars.input.disable();
            scene.children.getByName('optionsBG').setVisible(true).setDepth(10);

            // HEADING
            vars.UI.showUpgradesHeader(false);

            // close button
            let a = scene.add.image(vars.canvas.cX,vars.canvas.height-50,'difficultyButtons',0).setDepth(20).setName('ulClose').setInteractive();
            let b = scene.add.bitmapText(vars.canvas.cX-95,vars.canvas.height-80,'default','CLOSE', 48).setDepth(20).setName('ulClose').setInteractive();
            scene.groups.upgrades.addMultiple([a,b]);

            // how many upgrades for the current game do we have?
            let total = game.textures.list[_upgradeFor].frameTotal-2;
            let base = 9; total-=base;
            // build the unlock list for cards
            if (vars.cards.unlockedStr==='') {
                vars.cards.unlockedToStr();
            }
            let unlockedStr = vars.cards.unlockedStr;
            
            let unlockables = [_upgradeFor + '_9']; let unlockablesIDs = [9];
            for (let cID=65; cID<65+total; cID++) {
                let cName = _upgradeFor + '_' + String.fromCharCode(cID)
                // check if this card is already unlocked
                if (!unlockedStr.includes(cName)) {
                    unlockables.push(cName); unlockablesIDs.push((cID-65)+10);
                }
            }

            if (unlockables.length>0) {
                let xMin = 120; let xMax = vars.canvas.width; let xInc=240;
                let yMin = 235; let yInc = 300;
                let colMax=~~(xMax/xInc);
                for (let row=0; row<3; row++) {
                    for (let col=0; col<colMax; col++) {
                        let position = col + (row*colMax);
                        if (position<unlockables.length) {
                            let unlock = unlockables[position];
                            let unlockID = unlockablesIDs[position];
                            let cardLetter = unlock.split('_')[1];
                            let x = xMin + (col*xInc); let y = yMin + (row*yInc);
                            if (vars.DEBUG===true) { console.log('Position: ' + position + '. Unlock ID: ' + unlockID + '. Card letter: ' + cardLetter + '. xy: ' + x + ',' + y + '. Unlock: ' + unlock); }
                            // TODO BEGIN HERE
                            let u = scene.add.image(x,y,_upgradeFor, 'card' + cardLetter).setName('unlockable').setData({ name: unlock, cID: unlockID }).setDepth(20).setInteractive();
                            scene.groups.upgrades.add(u);
                        }
                    }
                }

            }
        },

        showUpgradesHeader: function(_update) {
            let unlocksLeft = ~~(vars.game.score/vars.cards.getCardCost());
            let multi = 'S'
            if (unlocksLeft===1) { multi = ''; }
            if (_update===false) {
                let h = scene.add.bitmapText(30,20,'default','YOU CAN UNLOCK ' + unlocksLeft + ' CARD' + multi,62).setDepth(20).setName('ulHeader');
                scene.groups.upgrades.add(h);
            } else {
                scene.children.getByName('ulHeader').setText('YOU CAN UNLOCK ' + unlocksLeft + ' CARD' + multi);
            }
        }

    }

}