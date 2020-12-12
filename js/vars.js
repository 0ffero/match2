const consts = {
    veryEasy: {
        points: {
            //     [low prize --------------------- best prize]
            //       >40  <=39  <=29   <=19    13   <=12,  9
            prize: [  20,   40,   100,   150,  200,   300, 500]
            // coinsS:10    20     50     75   100    150  250
            // CoinsG: 0     0      0      0    40     60  100
        },
        cardBacks: ['cardBack', 'cardBackAlt'],
        cardCost: 100,
        coinForPair: 'S',
        coinWorthG: 5, // only used for wins <=12 (as youd need 150/250 silver coins)
        coinWorthS: 2,
        pairWorth: 2
    },
    easy: {
        points: {
            //     [low prize --------------------- best prize]
            //       >40  <=39  <=29   <=19    13   <=12,  9
            prize: [  20,   40,   100,   150,  200,   300, 500]
            // coinsS:10    20     50     75   100    150  250
            // CoinsG: 0     0      0      0    40     60  100
        },
        cardBacks: ['cardBack', 'cardBack'],
        cardCost: 100,
        coinForPair: 'S',
        coinWorthG: 5, // only used for wins <=12 (as youd need 150/250 silver coins)
        coinWorthS: 2,
        pairWorth: 2
    },
    normal: {
        points: {
            prize:    [100, 200, 250, 500, 1500, 2000, 5000]
            // coinsS   20   40   50  100,  300   400  1000]
            // coinsG   10   20   25   50   150   200   500!
        },
        cardBacks: ['cardBack', 'cardBack'],
        cardCost: 1000,
        coinForPair: 'G',
        coinWorthG: 10,
        coinWorthS: 5,
        pairWorth: 20
    },
    hard: {
        points: {
            prize: [   100, 100, 100, 200, 500,  1000, 2000]
            // coinsS   20   20   20   40  100    200   400]
            // coinsG   10   10   10   20   50    100   200
        },
        cardBacks: ['cardBack', 'cardBack'],
        cardCost: 1000,
        coinForPair: 'G',
        coinWorthG: 10,
        coinWorthS: 5,
        pairWorth: 10
    },

    convertMovesToPrize: function() {
        let prize=0;
        let gV = vars.game;
        let difficulty = gV.difficulty;
        let cDif = consts[difficulty];
        if (gV.moves===9) { // no cheating!
            prize = cDif.points.prize[6];
        } else if (gV.moves<=12) {
            prize = cDif.points.prize[5];
        } else if (gV.moves===13) {
            prize = cDif.points.prize[4];
        } else if (gV.moves<=19) {
            prize = cDif.points.prize[3];
        } else if (gV.moves<=29) {
            prize = cDif.points.prize[2];
        } else if (gV.moves<=39) {
            prize = cDif.points.prize[1];
        } else if (gV.moves>=40) {
            prize = cDif.points.prize[0];
        }

        let cWorthG = cDif.coinWorthG; let cWorthS = cDif.coinWorthS;
        let coinData = consts.convertPrizeToCoins(cWorthG, cWorthS, prize);

        if (prize>0) {
            vars.animate.coinsGenerate(coinData);
        } else {
            console.warn('WARNING!\nApparently you completed the game in ' + gV.moves + ' moves. Your prize is: ' + prize);
        }
    },

    convertPrizeToCoins: function(_gold, _silver, _prize) {
        console.log('Prize: ' + _prize + ' (s:' + _silver + ', g:' + _gold + ')');
        let oPrize = _prize;

        let gV = vars.game;
        if (gV.score + _prize<100 && gV.firstGame===true) {
            _prize = 100-gV.score;
            vars.localStorage.bonusGiven();
        }

        // figure out the amount of silver and gold coins needed
        sCoins = 0;
        if (_prize/_silver>=100) {
            if (vars.DEBUG===true) { console.log('Generating Gold And Silver'); }
            sCoins=40; sWorth = sCoins*_silver; _prize -= sWorth; gCoins = _prize/_gold;
        } else {
            if (vars.DEBUG===true) { console.log('Generating Silver'); }
            gCoins=0; sCoins = _prize/_silver;
        }

        if (vars.DEBUG===true) { console.log(gCoins + ' gold pieces + ' + sCoins + ' silver pieces needed'); }

        let tCoins = gCoins + sCoins;

        // set up the duration, delay and coin volume vars (more coins generate cause more coins to ping around the same time, causing a louder perceived volume, so volume needs to be tuned based on coin count)
        let duration = 3; let delay = 5;
        let aV = vars.audio;
        aV.volumeOfCoins=0.2;
        if (tCoins >=400) { aV.volumeOfCoins=0.03; delay = 0.5; } else if (tCoins >=200) { aV.volumeOfCoins=0.05; delay = 1.5; } else if (tCoins >=100) { aV.volumeOfCoins=0.1; delay = 2; }
        if (tCoins>=100) { duration = 2; }
        duration*=1000;

        if (vars.DEBUG===true) { console.log('Delay: ' + delay + '. Duration: ' + duration); }
        return { g: gCoins, s: sCoins, gW: _gold, sW: _silver, duration: duration, delay: delay, prize: oPrize }
    },

    getTint: function(__score) {
        let tint = 0xffffff;
        if (__score >= vars.cards.getCardCost()) { tint = 0xffff00; }
        return tint;
    }
}
var vars = {
    DEBUG: true,

    audio: {
        volumeOfCoins: 0.2
    },

    canvas: {
        width: 1920,
        height: 1080,
        cX: 1920/2,
        cY: 1080/2,
    },

    colours: {
        backgrounds: [
            [[0x440000],[0x990000],[0xcc0000]],
            [[0x004400],[0x009900],[0x00cc00]],
            [[0x000044],[0x000099],[0x0000cc]]
        ]
    },

    convertors: {
        fromLetterToFrame: function(_letter) {
            return _letter.charCodeAt(0);
        }
    },

    durations: {
        moveToWinPosition: 3000,
        playAgain: 1000,
        turnDuration: 300,
        wellDone: 4000,
    },

    emitters: {
        create: function() {
            let p0 = new Phaser.Math.Vector2(0, vars.canvas.height+200);
            let p1 = new Phaser.Math.Vector2(vars.canvas.width*0.33, vars.canvas.height);
            let p2 = new Phaser.Math.Vector2(vars.canvas.width*0.66, vars.canvas.height);
            let p3 = new Phaser.Math.Vector2(vars.canvas.width, vars.canvas.height+200);

            let curve = new Phaser.Curves.CubicBezier(p0, p1, p2, p3);

            let max = 40;
            let points = [];
            let tangents = [];

            for (let c=0; c<=max; c++) {
                let t = curve.getUtoTmapping(c / max);
                points.push(curve.getPoint(t));
                tangents.push(curve.getTangent(t));
            }

            let tempVec = new Phaser.Math.Vector2();

            let spark0 = scene.add.particles('spark0').setName('fw_0');
            let spark1 = scene.add.particles('spark1').setName('fw_1');

            for (let i=0; i<points.length; i++) {
                let p = points[i];
                tempVec.copy(tangents[i]).normalizeRightHand().scale(-32).add(p);
                let angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(p, tempVec));
                let particles = (i % 2 === 0) ? spark0 : spark1;
                particles.createEmitter({ x: tempVec.x, y: tempVec.y, alpha: 0.33, angle: angle, speed: { min: -100, max: 1200 }, gravityY: 200, scale: { start: 0.4, end: 0.1 }, lifespan: 800, blendMode: 'SCREEN' });
            }
        },

        destroy: function() {
            scene.children.getByName('fw_0').destroy();
            scene.children.getByName('fw_1').destroy();
        }
    },

    files: {
        destroy: {
            images: ['cardBack', 'cardBackAlt'],
            sounds: [],
        },

        batman: {
            cardType: 'spritesheet',
            editionText: 'Lego Batman Edition',
            paragraph: '\n\n',
            welcomeData: [50, 920, 52, 1, 0.9, 1],
            images: [
                ['cardBack','images/batmanCardBack.png'],
                ['cardBackAlt','images/batmanCardBackSilver.png'],
            ],
            cards: {
                spritesheet: ['batmanLego','imageSets/batmanLego.png', 200, 260, 1, 2]
            },
            font: ['batFont','fonts/batFont.png','fonts/batFont.xml'],
            sounds: {
                good: ['batmanYes1.ogg','batmanYes2.ogg','batmanYes3.ogg','batmanYes4.ogg','batmanYes5.ogg'],
                bad:  ['batmanNo1.ogg','batmanNo2.ogg','batmanNo3.ogg','batmanNo4.ogg','batmanNo5.ogg','batmanNo6.ogg','batmanNo7.ogg'],
                win:  'batmanWin.ogg'
            }
        },

        dragons: {
            cardType: 'spritesheet',
            editionText:'Dragons: Rescue Riders Edition',
            paragraph: '\n',
            welcomeData: [50, 905, 80, 1, 1.73, 1],
            images: [
                ['cardBack','images/dragonsCardBack.png'],
                ['cardBackAlt','images/dragonsCardBackSilver.png'],
            ],
            cards: {
                spritesheet: ['dragonsRR', 'imageSets/dragonsRR.png', 200, 260, 1, 2]
            },
            font: ['dragonFont','fonts/dragonsRRFont.png','fonts/dragonsRRFont.xml'],
            sounds: {
                good: [],
                bad: [],
                win: 'dragonsWin.ogg',
                init: function() {
                    this.bad = Phaser.Utils.Array.NumberArray(1,17,'dragonsNo','.ogg');
                    this.good = Phaser.Utils.Array.NumberArray(1,8,'dragonsYes','.ogg');
                }
            },

            init: function() {
                this.sounds.init();
            }
        },

        starWarsLego: {
            cardType: 'spritesheet',
            editionText: 'Lego Star Wars Edition',
            paragraph: '\n',
            welcomeData: [70,885,100,1,1.1,1],
            images: [
                ['cardBack','images/sWLCardBack.png'],
                ['cardBackAlt','images/sWLCardBackSilver.png'],
            ],
            cards: {
                spritesheet: ['starWarsLego','imageSets/legoStarWars.png', 200, 260, 1, 2]
            },
            font: ['starFont','fonts/starFont.png','fonts/starFont.xml'],
            sounds: {
                good: ['starWarsYes1.ogg','starWarsYes2.ogg','starWarsYes3.ogg','starWarsYes4.ogg','starWarsYes5.ogg','starWarsYes6.ogg','starWarsYes7.ogg'],
                bad:  ['starWarsNo1.ogg','starWarsNo2.ogg','starWarsNo3.ogg','starWarsNo4.ogg','starWarsNo5.ogg','starWarsNo6.ogg','starWarsNo7.ogg','starWarsNo8.ogg','starWarsNo9.ogg'],
                win:  'starWarsWin.ogg'
            }
        },

        loadAssets: function() {
            let files;
            switch (vars.imageSets.current) {
                case 'batmanLego': files = vars.files.batman; multiLoader(files); break;
                case 'dragonsRR': files = vars.files.dragons; files.init(); multiLoader(files); break;
                case 'starWarsLego': files = vars.files.starWarsLego; multiLoader(files); break;
            }
        }
    },

    groups: {
        empty: function(_gName) {
            let selectedGroup = scene.groups[_gName];
            selectedGroup.children.each( (c)=> {
                c.destroy();
            })
        }
    },

    imageSets: {
        available: ['batmanLego','starWarsLego', 'dragonsRR'],
        fileName: ['batman','starWarsLego','dragons'],
        current: 'dragonsRR',
        currentFName: -1,

        init: function() {
            let iSV = vars.imageSets;
            let avail = iSV.available;
            let imageSetName = iSV.current;
            let valid=false;
            for (let i=0; i<avail.length; i++) {
                if (avail[i]===imageSetName) { // valid cardSet
                    iSV.currentFName = iSV.fileName[i];
                    valid=true; break;
                }
            }
            return valid;
        }
    },

    localStorage: {
        init: function() {
            let lS = window.localStorage;
            let lV = vars.localStorage;
            let gV = vars.game;
            if (lS.match2_selectedGame===undefined) {
                lS.match2_selectedGame='batmanLego';
                lS.match2_best=999;
                lS.match2_bgColour='2,0';
                gV.bestScore=999;
            } else {
                gV.bestScore=parseInt(lS.match2_best);
                vars.imageSets.current = lS.match2_selectedGame;
            }

            // updates since caleb first played the game
            // backgrounds
            if (lS.match2_bgColour===undefined) {
                lS.match2_bgColour='2,0';
            } else {
                gV.bgColour= lS.match2_bgColour;
            }

            // difficulty
            if (lS.match2_difficulty===undefined) {
                lS.match2_difficulty='veryEasy';
            } else {
                gV.difficulty = lS.match2_difficulty;
            }

            // score system (ie coins)
            if (lS.match2_playerScoreEVE===undefined) {
                lS.match2_playerScoreEVE=0;
                lS.match2_playerScoreNH=0;
                gV.score = 0;
            } else {
                if (gV.difficulty.toLowerCase().includes('easy')) {
                    gV.score = parseInt(lS.match2_playerScoreEVE);
                } else {
                    gV.score = parseInt(lS.match2_playerScoreNH);
                }
            }

            // unlocks
            if (lS.match2_unlocks===undefined) {
                lS.match2_unlocks='';
            } else {
                vars.cards.unlockedStr = '';
                vars.cards.unlocked = [];
                let unlocks = lV.convertLSunlocks(lS.match2_unlocks);
                vars.cards.unlocks = unlocks;
                vars.cards.unlockedToStr();
            }

            // player daily bonus
            if (lS.match2_bonusGiven===undefined) {
                lS.match2_bonusGiven='10112020';
                gV.firstGame = true;
            } else {
                let cDate = lV.getDate();
                if (lS.match2_bonusGiven!==cDate) {
                    gV.firstGame = true;
                } else {
                    gV.firstGame = false;
                }
            }

        },

        bonusGiven: function() {
            let gV = vars.game;
            let lS = window.localStorage;
            gV.firstGame = false;

            let cDate = vars.localStorage.getDate();
            lS.match2_bonusGiven = cDate;
        },

        checkForBestScore: function() {
            let lS = window.localStorage;
            let gV = vars.game;
            if (gV.moves<parseInt(lS.match2_best)) {
                let newHighScore = vars.game.moves;
                lS.match2_best = newHighScore;
                gV.bestScore = newHighScore;
            }
            vars.cards.pairsLeft[0]=vars.cards.pairsLeft[1];
        },

        convertLSunlocks: function(_unlocks) {
            let cV = vars.cards;
            let unlocks = _unlocks.split(';');
            if (unlocks.length>0) {
                console.log('Unlocks Found.');
                for (g of unlocks) {
                    let unlocks = g.split(',');
                    if (unlocks[0]!=='') {
                        let unlocked = [unlocks[0],unlocks[1]];
                        cV.unlocked.push(unlocked);
                    }
                }
            }
        },

        getDate: function() {
            let newDate = new Date();
            let cDate = newDate.getDate().toString() + (newDate.getMonth() + 1).toString() + newDate.getFullYear().toString();
            return cDate;
        },

        saveDifficulty: function() {
            let lS = window.localStorage;
            lS.match2_difficulty = vars.game.difficulty;
        },

        saveScore: function(_newScore=0) {
            if (_newScore>=0) {
                let lS = window.localStorage;
                let gV = vars.game;
                if (gV.difficulty.toLowerCase().includes('easy')) {
                    lS.match2_playerScoreEVE = _newScore;
                } else {
                    lS.match2_playerScoreNH = _newScore;
                }
            }
        },

        saveUnlockedCard: function(_cardName, _cardID) {
            let lS = window.localStorage;
            lS.match2_unlocks+=_cardName + ',' + _cardID + ';';
        },

        updateBGColour: function() {
            let lS = window.localStorage;
            lS.match2_bgColour = vars.game.bgColour;
        },

        updateCardSet: function(_cardSet=null) {
            if (_cardSet===null) { console.warn('You forgot to send the cardSet you wanted!'); return false; }
            let lS = window.localStorage;
            let needsReset = false;
            let possibleDestruction = lS.match2_selectedGame;
            if (_cardSet!==possibleDestruction) {
                // check for valid card set
                let valid = false;
                for (avail of vars.imageSets.available) { if (_cardSet===avail) { valid=true; break; } }
                // was a valid card set found that wasnt already selected?
                if (valid===true) { lS.match2_selectedGame=_cardSet; needsReset=true; } else { return false; }
                // we need to delete the old cardBack and Alt
                for (image of vars.files.destroy.images) {
                    scene.textures.removeKey(image);
                }
                for (s of vars.files.destroy.sounds) {
                    scene.cache.audio.remove(s);
                }
                if (needsReset===true) { vars.game.reset(); } else { return false; }
            } else {
                return false;
            }
        }
    },

    animate: {
        init: function() {
            let selectedSprite = 'coinG';
            let frameNames = Phaser.Utils.Array.NumberArray(1,12,'frame');
            scene.anims.create({
                key: selectedSprite,
                frames: scene.anims.generateFrameNumbers(selectedSprite, { frames: frameNames }),
                frameRate: 12,
                repeat: -1
            });

            frameNames = Phaser.Utils.Array.NumberArray(1,12,'frame', 's');
            selectedSprite = 'coinS';
            scene.anims.create({
                key: selectedSprite,
                frames: scene.anims.generateFrameNumbers(selectedSprite, { frames: frameNames }),
                frameRate: 12,
                repeat: -1
            });
        },

        coinsGenerate: function(_coinData) {
            let uiV = vars.UI;
            let sWorth = _coinData.sW;
            let gWorth = _coinData.gW;
            let sCoins = _coinData.s;
            let gCoins = _coinData.g;
            let duration = _coinData.duration;
            let delay = _coinData.delay;

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

                    scene.tweens.add({
                        targets: a,
                        delay: tDelay,
                        key: { min: 1, max: fC },
                        ease: 'Quad.easeIn',
                        y: vars.canvas.height+100,
                        duration: tDuration,
                        onComplete: oC
                    })
                }
            }

            // create the silver coins
            if (sCoins>0) { // this check isnt really needed as we always have silver coins
                let coin = 'coinS';
                let oC = vars.game.addCoinToScore;
                let ic=false;
                let lC = false;

                for (let s=1; s<=sCoins; s++) {
                    //if (vars.DEBUG===true) { console.log('Creating Silver coin ' + s + ' of ' + sCoins); }
                    let tDelay = s*16.67777*delay;
                    let tDuration = Phaser.Math.RND.between(dMin,dMax);
                    let scale = Phaser.Math.RND.between(40, 60)/100;
                    let a = scene.add.sprite(Phaser.Math.RND.between(xMin,xMax),-200,coin).setScale(scale).setDepth(5);
                    if (s===sCoins) {
                        lC = true;
                        tDuration = dMax;
                    }
                    a.setData({ 'prize': sWorth, 'ignoreClear': ic, 'lastCoin': lC });

                    scene.groups.coins.add(a);

                    let rev = Phaser.Math.RND.between(0,1) === 1 ? true : false;
                    rev === false ? a.anims.play(coin) : a.anims.playReverse(coin);

                    scene.tweens.add({
                        targets: a,
                        delay: tDelay + goldDelay,
                        key: { min: 1, max: fC },
                        ease: 'Quad.easeIn',
                        y: vars.canvas.height+100,
                        duration: tDuration,
                        onComplete: oC
                    })
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
            scene.tweens.add({
                targets: cardA,
                x: x,
                y: y,
                scale: 0.5,
                rotation: Math.PI*3+rndAngle,
                ease: 'Cubic.easeOut',
                duration: duration,
            });
            scene.tweens.add({
                targets: cardB,
                x: x+10,
                y: y+10,
                scale: 0.5,
                rotation: Math.PI*3+rndAngle,
                ease: 'Cubic.easeOut',
                duration: duration,
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

            let duration = vars.durations.turnDuration/2;

            scene.tweens.add({
                targets: [card1,card2],
                delay: duration*3,
                scaleX: 0,
                duration: duration
            })
            scene.tweens.add({
                targets: [back1,back2],
                delay: duration*4,
                scaleX: 1,
                duration: duration,
                onComplete: vars.input.enable,
            })
        },

        unlockCardSpin: function(_card) {
            // set the card to bought
            _card.setData('bought', true);

            // reduce the alpha of all other cards
            let cardName = _card.getData('name');
            scene.groups.upgrades.children.each( (c)=> {
                let cDataName = c.getData('name');
                console.log(cDataName + ' - ' + cardName);
                if (cDataName!==cardName) {
                    if (vars.DEBUG===true) { console.log('Tweening alpha to 0.2'); }
                    scene.tweens.add({
                        targets: c,
                        alpha: 0.2,
                        duration: 500,
                    })
                } else {
                    console.log('Card Found! Leaving alpha at 1');
                    c.setDepth(21);
                }
            })

            // tween the bought card
            let finalScale=2;
            let rotations=4;
            let x = vars.canvas.cX; let y = vars.canvas.cY;
            scene.tweens.add({
                targets: _card,
                delay: 250,
                alpha: 1,
                x: x,
                y: y,
                scale: finalScale,
                rotation: Math.PI*rotations,
                duration: 2000,
                onComplete: vars.UI.hideUnlocked
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
        options: [['cmd_batmanLego','batmanButton'],['cmd_starWarsLego','starWarsButton'], ['cmd_dragonsRR', 'dragonsButton']],
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
            let card1 = cV.selected[0][0]; let card2 = cV.selected[1][0];
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
                    scene.tweens.add({
                        targets: s,
                        delay: delay,
                        key: { min: 1, max: 12 },
                        ease: 'Quad.easeIn',
                        y: vars.canvas.height+100,
                        duration: 1000,
                        onComplete: oC
                    })
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
                scene.tweens.add({
                    targets: c,
                    scaleX: 1,
                    duration: duration
                })
            })
        },

        showThisCard: function(_card) {
            if (vars.input.enabled===false) { return false; }
            if (vars.DEBUG===true) { console.log('Showing This card'); }
            let cardName = _card.name; // this is the back of the card
            cardName = cardName.match(/\w+_([0-9]{1,2})_([ab])/);
            cardName = 'card_' + cardName[1] + '_' + cardName[2];
            if (vars.DEBUG===true) { console.log('Looking for ' + cardName); }
            let card = scene.children.getByName(cardName);

            let duration = vars.durations.turnDuration/2;

            scene.sound.play('cardTurn');

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
                for (u of uArray) {
                    cV.unlockedStr+=u[0] + ',';
                }
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
                // we need to reset the game here
                vars.game.reset();
            } else { // player has selected the current difficulty, hide the options screen, nothing else needs done
                vars.UI.optionsHide();
            }
        },

        drawCards: function() {
            let gV = vars.game;
            gV.moves=0;
            let cV = vars.cards;
            let xyOffset = 20;
            let xInc = cV.cardWidth+xyOffset;
            let yInc = cV.cardHeight+xyOffset;
            let yPush = 70;
            let cardSet = vars.imageSets.current;
            let cardArray = cV.cardArray;
            let cardPosArray = cV.cardPosArray;
            let cCX = cV.cardWidth/2 + 10;
            let cCY = cV.cardHeight/2 + 10;
            let difficulty = gV.difficulty;
            let cardBacks = consts[difficulty].cardBacks;

            if (scene.children.getByName('gameBG')===null) { 
                let tint = vars.UI.getBGColour();
                scene.add.image(vars.canvas.cX, vars.canvas.cY, 'background').setName('gameBG').setTint(tint); 
            }

            let cardDeck = vars.cards.createDeck();

            for (let c=0; c<9; c++) {
                let index = Phaser.Math.RND.between(0, cardDeck.length-1);
                index = cardDeck.splice(index,1); // remove the card from the array
                /* let index = cardDeck[0];
                index = cardDeck.splice(0,1); */

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
                let x = xPos1 * xInc + cCX; let y = yPos1 * yInc + cCY; y+=yPush;
                let picA = scene.add.sprite(x,y,cardSet,index).setName('card_' + index + '_a');
                picA.setData({ cardID: index, cNum: c, pair: 'a', x: x, y: y, xPos: xPos1, yPos: yPos1 }).setInteractive();
                // back of 1st card pair
                let cardBackA = scene.add.sprite(x,y,cardBacks[0]).setScale(0,1).setVisible(false).setName('back_' + index + '_a').setInteractive();
                // card 2
                x = xPos2 * xInc + cCX; y = yPos2 * yInc + cCY; y+=yPush;
                let picB = scene.add.sprite(x,y,cardSet,index).setName('card_' + index + '_b');
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
            } else {
                console.error('** The wellDone and playAgaint wasnt been set up! **')
            }

            // show the well done message
            let dV = vars.durations;
            scene.tweens.add({
                targets: wellDone,
                delay: dV.moveToWinPosition/2,
                alpha: 1,
                y: 100,
                duration: dV.wellDone
            })

            // show the play again button
            scene.tweens.add({
                targets: playAgain,
                delay: dV.wellDone + dV.moveToWinPosition/2, // <== the time for the cards to move to the win position on screen
                alpha: 1,
                duration: dV.playAgain
            })
        },

        reset: function() {
            scene.registry.destroy(); scene.events.off(); scene.scene.restart();
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
            groups.cardsGroup.children.each( (c)=> { c.destroy(); })
            groups.cardsGroup.clear();
            groups.cardBacksGroup.children.each( (c)=> { c.destroy(); })
            groups.cardBacksGroup.clear();

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
                } else if (card.name==='cmd_batmanLego' || card.name==='cmd_starWarsLego' || card.name==='cmd_dragonsRR') {
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
            let x = 1440; let xInc=180; let realX=x;
            let y=200; let yInc=180;
            let m=0;

            let bGTitle = scene.add.bitmapText(1360, 20, 'default', 'Backgrounds', 72, 1).setTint(0x0092DC).setName('bGTitle').setVisible(false).setDepth(11);
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
            scene.add.bitmapText(150, 20, 'default', 'Please select a card set...', 72, 1).setTint(0x0092DC).setName('optionsTitle').setVisible(false);
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
                batmanLego: {
                    fontSize: 40,
                    scale: [1,1.4],
                    xy: [15, 5]
                },
                dragonsRR: {
                    fontSize: 80,
                    scale: [1.7,1],
                    xy: [15, 5]
                },
                starWarsLego: {
                    fontSize: 100,
                    scale: [0.9,1],
                    xy: [15, -20]
                }
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
            let y = 770;
            let x = 1630;

            let difTitle = scene.add.bitmapText(x-135, y-100,'default','DIFFICULTY',42).setDepth(12).setVisible(false);
            scene.groups.bgOptions.add(difTitle);
            for (let d of difList) {
                let frame=1;
                if (d===gV.difficulty) { frame=0; }
                let a = scene.add.image(x, y, 'difficultyButtons', frame).setDepth(11).setName('dif_' + d).setVisible(false).setInteractive();
                let difficulty = d.capitalise();
                if (d==='veryEasy') { difficulty='Very Easy'; }
                let b = scene.add.bitmapText(x-150,y-25,'default',difficulty,42).setDepth(12).setName('dif_' + d).setVisible(false).setInteractive();
                scene.groups.bgOptions.addMultiple([a,b]);
                y+=85;
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
            scene.tweens.add({
                targets: card,
                delay: 2000,
                alpha: 0,
                duration: 2000,
                onComplete: vars.UI.destroyUnlockedCard
            })
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
                if (scene.children.getByName('ulHeader')!==null) {
                    vars.UI.showUpgradesHeader();
                }
                if (unlockText.length>0) {
                    pointsText.setInteractive();
                } else {
                    pointsText.disableInteractive();
                }
            }
        },

        setUnlockText: function() {
            let msg = '';
            let points = vars.game.score;
            let cardCost = vars.cards.getCardCost();

            if (points>=cardCost) {
                let unlocks = ~~(points/cardCost);
                let multi = 's';
                if (unlocks===1) { multi=''; }
                msg = ' (you can unlock ' + unlocks + ' card' + multi + ')';
                if (scene.children.getByName('ulHeader'!==null)) {
                    vars.UI.showUpgradesHeader(true);
                }
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

            let x = 650; let y = 200; let o=0; let logos = [];
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
            if (_upgradeFor!=='batmanLego' && _upgradeFor!=='starWarsLego' && _upgradeFor!=='dragonsRR') {
                console.error(_upgradeFor + ' is invalid!');
                return false;
            }
            vars.input.disable();
            scene.children.getByName('optionsBG').setVisible(true).setDepth(10);

            // HEADING
            vars.UI.showUpgradesHeader(false);

            // close button
            let a = scene.add.image(vars.canvas.cX,vars.canvas.height-50,'difficultyButtons',2).setDepth(20).setName('ulClose').setInteractive();
            let b = scene.add.bitmapText(vars.canvas.cX-95,vars.canvas.height-80,'default','CLOSE', 48).setDepth(20).setName('ulClose').setInteractive();
            scene.groups.upgrades.addMultiple([a,b]);

            // how many upgrades for the current game do we have?
            let total = game.textures.list[_upgradeFor].frameTotal-1;
            let base = 9; total-=base;
            // build the unlock list for cards
            let unlockables = []; let unlockablesIDs = [];
            if (vars.cards.unlockedStr==='') {
                vars.cards.unlockedToStr();
            }
            let unlockedStr = vars.cards.unlockedStr;

            for (let cID=65; cID<65+total; cID++) {
                let cName = _upgradeFor + '_' + String.fromCharCode(cID)
                // check if this card is already unlocked
                if (!unlockedStr.includes(cName)) {
                    unlockables.push(cName); unlockablesIDs.push(cID-65);
                }
            }

            if (unlockables.length>0) {
                let xMin = 120; let xMax = vars.canvas.width-200; let xInc=240;
                let row=0;
                let count=0; let cMax = 0;
                for (unlock of unlockables) {
                    let x = xMin + (count*xInc);
                    let y = 250 + (row*300);
                    let cID = unlockablesIDs[count + (cMax*row)];
                    console.log('Count: ' + count + ' Showing ' + unlock + ' at ' + x + ',' + y + '. cID: ' + cID);
                    let u = scene.add.image(x,y,_upgradeFor, cID+base).setName('unlockable').setData({ name: unlock, cID: cID+base }).setDepth(20).setInteractive();
                    scene.groups.upgrades.add(u);

                    count++;

                    if (x>xMax) { row++; cMax+=count; count=0; console.log('New Row'); }
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