vars.canvas = {
    width: 1920, height: 1080,
    cX: 1920/2, cY: 1080/2,
};

vars.colours = {
    backgrounds: [
        [[0x440000],[0x990000],[0xcc0000]],
        [[0x004400],[0x009900],[0x00cc00]],
        [[0x000044],[0x000099],[0x0000cc]]
    ]
}

vars.containers = {

    additionContainersCreate: function() {
        let dC = consts.depths;
        if (scene.containers===undefined) {
            scene.containers = { numberContainers: [] }
            scene.containers.warningContainer = scene.add.container().setName('warningContainer');
            let warningBG = scene.add.image(0,0,'warningBG',0).setName('warningBG').setScale(1.3,1);
            let warn = scene.add.bitmapText(0,0,'numbersFont','Turn over a question card first :)',58).setOrigin(0.5, 0.5).setName('numbersWarning').setTint(0xff0000);
            scene.containers.warningContainer.add([warningBG,warn]).setDepth(dC.game+2).setPosition(650,495).setSize(830,106).setAlpha(0);
        } else {
            scene.containers.numberContainers.forEach( (c)=> {
                c.destroy();
            })
            scene.containers.numberContainers = [];
            // empty out the contents of the blackBGs
            scene.groups.additionBlackBGs.children.each( (c)=> {
                c.destroy();
            })
        }

        // build the containers
        let sC = scene.containers;
        for (let c=0; c<18; c++) { // create the containers
            sC.numberContainers.push(scene.add.container().setName('container_' + c));
        }
    }
}

vars.convertors = {
    fromLetterToFrame: function(_letter) {
        return _letter.charCodeAt(0);
    }
},

vars.durations = {
    moveToWinPosition: 3000,
    playAgain: 1000,
    turnDuration: 300,
    wellDone: 4000,
}

vars.emitters =  {
    create: function() {
        let p0 = new Phaser.Math.Vector2(0, vars.canvas.height+200);
        let p1 = new Phaser.Math.Vector2(vars.canvas.width*0.33, vars.canvas.height);
        let p2 = new Phaser.Math.Vector2(vars.canvas.width*0.66, vars.canvas.height);
        let p3 = new Phaser.Math.Vector2(vars.canvas.width, vars.canvas.height+200);
        let curve = new Phaser.Curves.CubicBezier(p0, p1, p2, p3);
        let max = 40; let points = []; let tangents = [];

        for (let c=0; c<=max; c++) { let t = curve.getUtoTmapping(c / max); points.push(curve.getPoint(t)); tangents.push(curve.getTangent(t)); }

        let tempVec = new Phaser.Math.Vector2();
        let spark0 = scene.add.particles('spark0').setName('fw_0'); let spark1 = scene.add.particles('spark1').setName('fw_1');

        for (let i=0; i<points.length; i++) {
            let p = points[i]; tempVec.copy(tangents[i]).normalizeRightHand().scale(-32).add(p);
            let angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.BetweenPoints(p, tempVec));
            let particles = (i % 2 === 0) ? spark0 : spark1;
            particles.createEmitter({ x: tempVec.x, y: tempVec.y, alpha: 0.33, angle: angle, speed: { min: -100, max: 1200 }, gravityY: 200, scale: { start: 0.4, end: 0.1 }, lifespan: 800, blendMode: 'SCREEN' });
        }
    },

    destroy: function() {
        scene.children.getByName('fw_0').destroy();
        scene.children.getByName('fw_1').destroy();
    }
}

vars.files = {
    audio: {
        others: [
            ['coinAdd', 'audio/coin.ogg'],
            ['unlock', 'audio/unlock.ogg'],
            ['cardTurn', 'audio/cardTurn.m4a']
        ]
    },

    backgrounds: {
        list: [],
        backgroundsData: [['batmanLego',54,'.jpg']],

        init: function() {
            let bgDatas = this.backgroundsData;
            let differentBGs = bgDatas.length;

            for (let b=0; b<differentBGs; b++) {
                let bgData = bgDatas[b];
                let pre = bgData[0]; let max=bgData[1]; let ext = bgData[2]
                vars.files.backgrounds.list.push(Phaser.Utils.Array.NumberArray(1,max,pre + 'BG_', ext));
            }
        }
    },

    destroy: {
        images: ['cardBack', 'cardBackAlt'],
        sounds: [],
    },

    addition: {
        cardType: 'spritesheet',
        editionText: 'Addition Edition',
        paragraph: '\n',
        welcomeData: [50, 920, 60, 1, 1.3, 0.95],
        cards: null, // addition and subtraction dont have "backs" as cards are always face forward
        font: ['numbersFont', 'fonts/numbersFont.png', 'fonts/numbersFont.xml'],
        sounds: {
            good: ['batmanYes1.ogg','batmanYes2.ogg','batmanYes3.ogg','batmanYes4.ogg','batmanYes5.ogg'],
            bad:  ['batmanNo1.ogg','batmanNo2.ogg','batmanNo3.ogg','batmanNo4.ogg','batmanNo5.ogg','batmanNo6.ogg','batmanNo7.ogg'],
            win:  'batmanWin.ogg'
        },
    },

    subtraction: {
        cardType: 'spritesheet',
        editionText: 'Subtraction Edition',
        paragraph: '\n',
        welcomeData: [50, 920, 60, 1, 1.3, 0.95],
        cards: null, // addition and subtraction dont have "backs" as cards are always face forward
        font: ['numbersFont', 'fonts/numbersFont.png', 'fonts/numbersFont.xml'],
        sounds: {
            good: ['batmanYes1.ogg','batmanYes2.ogg','batmanYes3.ogg','batmanYes4.ogg','batmanYes5.ogg'],
            bad:  ['batmanNo1.ogg','batmanNo2.ogg','batmanNo3.ogg','batmanNo4.ogg','batmanNo5.ogg','batmanNo6.ogg','batmanNo7.ogg'],
            win:  'batmanWin.ogg'
        },
    },

    batman: {
        cardType: 'atlas',
        editionText: 'Lego Batman Edition',
        paragraph: '\n\n',
        welcomeData: [50, 920, 52, 1, 0.9, 1],
        images: [
            ['cardBack','images/batmanCardBack.png'],
            ['cardBackAlt','images/batmanCardBackSilver.png'],
        ],
        cards: {
            atlas: ['batmanLego','imageSets/batmanLego.png','imageSets/batmanLego.json']
        },
        font: ['batFont','fonts/batFont.png','fonts/batFont.xml'],
        sounds: {
            good: ['batmanYes1.ogg','batmanYes2.ogg','batmanYes3.ogg','batmanYes4.ogg','batmanYes5.ogg'],
            bad:  ['batmanNo1.ogg','batmanNo2.ogg','batmanNo3.ogg','batmanNo4.ogg','batmanNo5.ogg','batmanNo6.ogg','batmanNo7.ogg'],
            win:  'batmanWin.ogg'
        }
    },

    dragons: {
        cardType: 'atlas',
        editionText:'Dragons: Rescue Riders Edition',
        paragraph: '\n',
        welcomeData: [50, 905, 80, 1, 1.73, 1],
        images: [
            ['cardBack','images/dragonsCardBack.png'],
            ['cardBackAlt','images/dragonsCardBackSilver.png'],
        ],
        cards: {
            atlas: ['dragonsRR','imageSets/dragonsRR.png','imageSets/dragonsRR.json']
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
        cardType: 'atlas',
        editionText: 'Lego Star Wars Edition',
        paragraph: '\n',
        welcomeData: [70,885,100,1,1.1,1],
        images: [
            ['cardBack','images/sWLCardBack.png'],
            ['cardBackAlt','images/sWLCardBackSilver.png'],
        ],
        cards: {
            atlas: ['starWarsLego','imageSets/legoStarWars.png','imageSets/legoStarWars.json']
        },
        font: ['starFont','fonts/starFont.png','fonts/starFont.xml'],
        sounds: {
            good: ['starWarsYes1.ogg','starWarsYes2.ogg','starWarsYes3.ogg','starWarsYes4.ogg','starWarsYes5.ogg','starWarsYes6.ogg','starWarsYes7.ogg'],
            bad:  ['starWarsNo1.ogg','starWarsNo2.ogg','starWarsNo3.ogg','starWarsNo4.ogg','starWarsNo5.ogg','starWarsNo6.ogg','starWarsNo7.ogg','starWarsNo8.ogg','starWarsNo9.ogg'],
            win:  'starWarsWin.ogg'
        }
    },

    toyStory: {
        cardType: 'atlas',
        editionText: 'Toy Story Edition',
        paragraph: '\n',
        welcomeData: [50, 920, 60, 1, 1.42, 0.95],
        images: [
            ['cardBack','images/toyStoryCardBack.png'],
            ['cardBackAlt','images/toyStoryCardBackSilver.png'],
        ],
        cards: {
            atlas: ['toyStory','imageSets/toyStory.png','imageSets/toyStory.json']
        },
        font: ['toyStoryFont','fonts/toyStoryFont.png','fonts/toyStoryFont.xml'],
        sounds: {
            good: [],
            bad:  [],
            win:  'toyStoryWin.ogg',

            init: function() {
                this.bad = Phaser.Utils.Array.NumberArray(1,13,'toyStoryNo','.ogg');
                this.good = Phaser.Utils.Array.NumberArray(1,12,'toyStoryYes','.ogg');
            }
        },

        init: function() {
            this.sounds.init();
        }
    },

    getFileData: function() {
        let fName = vars.imageSets.currentFName;
        return vars.files[fName];
    },
    
    loadAssets: function() {
        let files;
        switch (vars.imageSets.current) {
            case 'batmanLego':   files = vars.files.batman;                     multiLoader(files); break;
            case 'dragonsRR':    files = vars.files.dragons;      files.init(); multiLoader(files); break;
            case 'starWarsLego': files = vars.files.starWarsLego;               multiLoader(files); break;
            case 'toyStory':     files = vars.files.toyStory;     files.init(); multiLoader(files); break;

            case 'addition':     multiLoaderNumbers('addition'); break;
            case 'subtraction':  multiLoaderNumbers('subtraction'); break;
        }
    }
},

vars.groups = {
    empty: function(_gName) {
        let selectedGroup = scene.groups[_gName];
        selectedGroup.children.each( (c)=> {
            c.destroy();
        })
    },

    additionGroupsCreate: function() {
        if (scene.groups.questions===undefined) { // this is the first time weve entered this function, so we need to create the groups and containers
            scene.groups.questions = scene.add.group();
            scene.groups.answers = scene.add.group();
        } else { // empty out the two card groups
            scene.groups.questions.children.each( (c)=> { c.destroy(); })
            scene.groups.answers.children.each( (c)=> { c.destroy(); })
        }
    }
}

vars.imageSets = {
    available: ['batmanLego','starWarsLego', 'dragonsRR', 'toyStory','addition','subtraction'],
    fileName: ['batman','starWarsLego','dragons','toyStory','addition','subtraction'],
    current: 'dragonsRR',
    currentFName: -1,

    init: function() {
        let iSV = vars.imageSets; let avail = iSV.available; let imageSetName = iSV.current; let valid=false;
        for (let i=0; i<avail.length; i++) { if (avail[i]===imageSetName) { iSV.currentFName = iSV.fileName[i]; valid=true; break; } }
        return valid;
    }
},

vars.localStorage = {
    init: function() {
        let lS = window.localStorage;
        let lV = vars.localStorage;
        let gV = vars.game;
        let cV = vars.cards;

        // reset all save vars so the unlocks work properly
        if (lS.match2_resetData===undefined) { lV.resetAll(); }

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
            cV.unlockedStr = '';
            cV.unlocked = [];
            let unlocks = lV.convertLSunlocks(lS.match2_unlocks);
            cV.unlocks = unlocks;
            cV.unlockedToStr();
        }

        if (lS.match2_unlocksAddition===undefined) {
            lS.match2_unlocksAddition='';
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

        // player name
        if (lS.match2_playerName===undefined) {
            lS.match2_playerName='Caleb';
        } else {
            vars.player.name = lS.match2_playerName
        }

    },

    backgroundsForNumbersUpdate: function() { // the player has unlocked the current background
        let gV = vars.game;
        // add it to the background names
        gV.backgroundNames.push(gV.currentBackground);
        // empty the current background var
        gV.currentBackground = '';
        // save the backgrounds
        let lS = window.localStorage;
        let bgList = gV.backgroundNames.toString();
        lS.match2_unlocksAddition = bgList;
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
            if (vars.DEBUG===true) { console.log('Unlocks Found.'); }
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

    resetAll: function() {
        if (vars.DEBUG===true) { console.warn('Resetting all variables!'); }
        let lS = window.localStorage;
        lS.match2_best = "999";
        lS.match2_bgColour = "2,0";
        lS.match2_bonusGiven = "10112020";
        lS.match2_difficulty = "veryEasy";
        if (lS.match2_playerScore!==undefined) { lS.removeItem('match2_playerScore'); }
        lS.match2_playerScoreEVE = "0";
        lS.match2_playerScoreNH = "0";
        lS.match2_selectedGame = "batmanLego";
        lS.match2_unlocks = "";
        lS.match2_resetData='true';
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
        let currentCardSet = lS.match2_selectedGame;
        if (_cardSet!==currentCardSet) {
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
}