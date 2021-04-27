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
        ],
        YesNoAvailable: ['batman', 'dragons', 'lava', 'ghostbusters', 'starWars', 'toyStory'],
        YesNoList: { batman: [5,7], dragons: [8,17], lava: [15,11], ghostbusters: [0,0], starWars: [7,9], toyStory: [12,13] }, // order = yes/no
        YesNoRandomSet: { yes: [], no: [] },

        generateRandomSet: function() {
            // this creates a set of 10 yes and no sounds from all available card sets
            // its generated once per refresh of the page to limit the amount of downloaded files.
            if (this.YesNoRandomSet.yes.length===0 && this.YesNoRandomSet.no.length===0) {
                console.log('Generating random audio set for games without their own Yes No files.');
                let ynl = this.YesNoList;
                let yna = this.YesNoAvailable;
                let badList = []; let goodList = [];
                for (option of yna) {
                    let yn = ynl[option];
                    if (yn[0]>0) {
                        goodList.push(Phaser.Utils.Array.NumberArray(1,yn[0],`${option}Yes`));
                    }
                    if (yn[1]>0) {
                        badList.push(Phaser.Utils.Array.NumberArray(1,yn[1],`${option}No`));
                    }
                }
                let yesBulk = shuffle(goodList.flat());
                let noBulk = shuffle(badList.flat());
                this.YesNoRandomSet.yes = yesBulk.splice(0,10);
                this.YesNoRandomSet.no = noBulk.splice(0,10);
            } else {
                console.warn('The List has already been generated... Ignoring the call');
            }
        }
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
            good: [],
            bad:  [],
            win:  'batmanWin.ogg',

            init: function() {
                vars.files.additionSubtractionInit('addition');
            }
        },
    },

    additionSubtractionInit: function(_type) { // type is substraction or addition
        if (_type==='subtraction' || _type==='addition') {
            let fV = vars.files;
            let aFV = fV.audio;
            aFV.generateRandomSet();
            // move the random set into the list of available yes/no's
            let aV = vars.audio;
            aV.no  = aFV.YesNoRandomSet.no;
            aV.yes = aFV.YesNoRandomSet.yes;
            // push them to the good/bad array for posterity
            aV.yes.forEach( (aName)=> { fV[_type].sounds.good.push(`${aName}.ogg`); })
            aV.no.forEach( (aName)=> { fV[_type].sounds.bad.push(`${aName}.ogg`); })
        } else {
            console.error(`Error: Invalid type (should be subtraction or addition, was "${_type}"`)
        }
    },

    subtraction: {
        cardType: 'spritesheet',
        editionText: 'Subtraction Edition',
        paragraph: '\n',
        welcomeData: [50, 920, 60, 1, 1.3, 0.95],
        cards: null, // addition and subtraction dont have "backs" as cards are always face forward
        font: ['numbersFont', 'fonts/numbersFont.png', 'fonts/numbersFont.xml'],
        sounds: {
            good: [],
            bad:  [],
            win:  'batmanWin.ogg',

            init: function() {
                vars.files.additionSubtractionInit('subtraction');
            }
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

    floorIsLava: {
        cardType: 'atlas',
        editionText: 'Floor Is Lava Edition',
        paragraph: '\n',
        welcomeData: [100, 920, 60, 1, 1.3, 0.95],
        images: [
            ['cardBack','images/floorIsLavaCardBack.png'],
            ['cardBackAlt','images/floorIsLavaCardBackSilver.png'],
        ],
        cards: {
            atlas: ['floorIsLava','imageSets/floorIsLava.png','imageSets/floorIsLava.json']
        },
        font: ['numbersFont', 'fonts/numbersFont.png', 'fonts/numbersFont.xml'],
        sounds: {
            good: [],
            bad:  [],
            win:  'lavaWin.ogg',
            init: function() {
                this.bad = Phaser.Utils.Array.NumberArray(1,11,'lavaNo','.ogg');
                this.good = Phaser.Utils.Array.NumberArray(1,15,'lavaYes','.ogg');
            }
        },

        init: function() {
            this.sounds.init();
        }
    },

    ghostbusters: {
        ages: {
            age12: {  // this defines which files are overwritten when enabled
                sounds:  ['win'],

                loadOthers: ()=> {
                    scene.load.atlas('stayPuft', 'images/12+/stayPuftJoined.png', 'images/12+/stayPuftJoined.json');
                    scene.load.audio('stayPuftStep', 'audio/stayPuftStep.ogg');
                    vars.animate.animsAvailableForCardSet.push(vars.files.ghostbusters.ages.age12.animateStayPuft);
                },

                animateStayPuft: ()=> {
                    let animatedStayPuft = scene.add.image(vars.canvas.cX, vars.canvas.height+100, 'stayPuft').setOrigin(0.5,1).setScale(0.1);
                    scene.tweens.add({
                        targets: animatedStayPuft,
                        scale: 2.5,
                        duration: 8000
                    })
                    scene.tweens.add({
                        targets: animatedStayPuft,
                        duration: 500,
                        repeat: 6,
                        alpha: 0,
                        yoyo: true,
                        onYoyo: function (_tween, _object) {
                            _object.frame.name==='frame1' ? _object.setFrame('frame2') : _object.setFrame('frame1');
                            scene.sound.play('stayPuftStep');
                            vars.camera.shake(333);
                        },
                        onComplete: (_t, _o)=> {
                            scene.tweens.add({
                                targets: _o[0],
                                alpha: 0,
                                duration: 250
                            })
                        }
                    })
                }
            },
            age15: {
                images: ['cardBack'],

                loadOthers: ()=> {
                    scene.load.atlas('slimer', 'images/15+/slimerSheet.png', 'images/15+/slimerSheet.json');
                    scene.load.audio('slimer', 'audio/slimer.ogg');
                    scene.load.on('filecomplete-json-slimer', function (key,type,data) {
                        vars.files.ghostbusters.ages.age15.initSlimer();
                    })
                },

                initSlimer: ()=> {
                    console.log('Initialising Slimer Animation');
                    let body = scene.add.image(vars.canvas.cX, vars.canvas.cY, 'slimer','slimerBody');
                    let leftArm = scene.add.image(vars.canvas.cX-125, vars.canvas.cY+65, 'slimer', 'slimerLeftArm').setOrigin(1,1).setAngle(30);
                    let rightArm = scene.add.image(vars.canvas.cX+140, vars.canvas.cY+70, 'slimer', 'slimerRightArm').setOrigin(0,1).setAngle(320);

                    if (scene.containers===undefined) {
                        scene.containers = { }
                    }
                    scene.containers.slimer = scene.add.container(0, 0, [body, leftArm, rightArm]).setScale(0.1).setDepth(100).setAlpha(0.75).setVisible(false);

                    // animate the arms
                    scene.tweens.add({ targets: leftArm, angle: -30, repeat: -1, yoyo: true, duration: 250, delay: 250 })
                    scene.tweens.add({ targets: rightArm, angle: 45, repeat: -1, yoyo: true, duration: 250 })

                    vars.animate.animsAvailableForCardSet.push(vars.files.ghostbusters.ages.age15.animateSlimer);
                },

                animateSlimer: ()=> {
                    let slimer = scene.containers.slimer;
                    slimer.setVisible(true);
                    scene.sound.play('slimer');
                    scene.tweens.add({
                        targets: slimer,
                        scale: 2.5,
                        duration: 4000,
                        ease: 'Quad.easeIn',
                        onComplete: (_t, _o)=> {
                            _o[0].setScale(0.2);
                            _o[0].setVisible(false);
                        }
                    })
                }
            }
        },
        cardType: 'atlas',
        editionText: 'Ghostbusters Edition',
        paragraph: '\n',
        welcomeData: [100, 920, 72, 1, 1, 0.95],
        images: [
            ['cardBack','images/ghostbustersCardBack.png'],
            ['cardBackAlt','images/ghostbustersCardBackSilver.png'],
        ],
        cards: {
            atlas: ['ghostbusters','imageSets/ghostbusters.png','imageSets/ghostbusters.json']
        },
        font: ['ghostbustersFont', 'fonts/ghostbustersFont.png', 'fonts/ghostbustersFont.xml'],
        sounds: {
            good: [],
            bad:  [],
            win:  'ghostbustersWin.ogg',
            init: function() {
                this.bad = Phaser.Utils.Array.NumberArray(1,24,'ghostbustersNo','.ogg');
                this.good = Phaser.Utils.Array.NumberArray(1,16,'ghostbustersYes','.ogg');
            }
        },

        init: function() {
            vars.files.replaceAssets(this.ages, this.sounds, this.images); // you need to pass the age data as well as the stuff you wanna change
            this.sounds.init();
            if (vars.player.age15===true) {
                vars.files.ghostbusters.ages.age15.loadOthers();
            } else if (vars.player.age12===true) {
                vars.files.ghostbusters.ages.age12.loadOthers();
            }
        },

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
        let fV = vars.files;
        let cIV = vars.imageSets.current;
        switch (cIV) { // I could reduce this by doing fV[cIV] for the card set, but this makes it more obvious what its doing
            case 'batmanLego':   files = fV.batman;                     multiLoader(files); break;
            case 'dragonsRR':    files = fV.dragons;      files.init(); multiLoader(files); break;
            case 'floorIsLava':  files = fV.floorIsLava;  files.init(); multiLoader(files); break;
            case 'ghostbusters': files = fV.ghostbusters; files.init(); multiLoader(files); break;
            case 'starWarsLego': files = fV.starWarsLego;               multiLoader(files); break;
            case 'toyStory':     files = fV.toyStory;     files.init(); multiLoader(files); break;

            case 'addition':     fV.addition.sounds.init();    multiLoaderNumbers('addition');    break;
            case 'subtraction':  fV.subtraction.sounds.init(); multiLoaderNumbers('subtraction'); break;
        }

        if (vars.player.bDay.seen==='enabled') {
            scene.load.image('batCake',       'images/batCake.png');
            scene.load.audio('candleSpark',   'audio/sparkler.ogg');
            scene.load.image('spark1',        'particles/white.png');
            scene.load.audio('happyBirthday', 'audio/happyBirthdaySong.ogg');
            scene.load.audio('blowCandles',   'audio/blowOutCandles.ogg');
            scene.load.audio('hooray',        'audio/hooray.ogg');

            scene.load.bitmapFont('bDayFont', 'fonts/bdayFont.png', 'fonts/bdayFont.xml');
            scene.load.image('grass',         'images/grass.png'); // width,height = 925,158
        } else if (vars.player.bDay.seen===true) {
            scene.load.image('batCake',       'images/batCake.png');
        }
    },

    replaceAssets: (_ageData, _originalSounds, _originalImages)=> {
        let a12 = false; let a15 = false;
        let pV = vars.player;
        if (pV.age12) { a12=true; }
        if (pV.age15) { a15=true; }

        if (!a12 && !a15) {
            console.log('No changes were made to the files');
            return false;
        }
        let ages = { age12: a12, age15: a15 };

        // you only get to here by being 12+ or 15+
        ['age12','age15'].forEach( (ag)=> {
            if (_ageData[ag]!==undefined && ages[ag]) {
                let ageNum = ~~(ag.replace('age',''));
                let sounds = _ageData[ag].sounds===undefined ? false: _ageData[ag].sounds;
                let images = _ageData[ag].images===undefined ? false: _ageData[ag].images;

                // replace the named sound files (if any)
                if (sounds!==false) {
                    sounds.forEach( (replaceMe)=> {
                        console.log(`Replacing "${replaceMe}" with age ${ag.replace('age','')} appropriate audio`);
                        _originalSounds[replaceMe] = _originalSounds[replaceMe].replace(/\.[a-z]{3}/,`_${ageNum}$&`);
                    })
                }

                // replace the named image files (if any)
                if (images!==false) {
                    images.forEach( (replaceMe)=> {
                        console.log(`Replacing "${replaceMe}" with age ${ageNum} appropriate image`);
                        _originalImages.forEach( (img)=> {
                            if (img[0]===replaceMe) {
                                img[1] = img[1].replace(/\.[a-z]{3}/,`_${ageNum}$&`);
                            }
                        })
                    })
                }
            }
        })
    }
},

vars.groups = {
    init: ()=> {
        scene.groups = {};
        scene.groups.cardsGroup     = scene.add.group();
        scene.groups.cardBacksGroup = scene.add.group();
        scene.groups.foundGroup     = scene.add.group(); // unused
        scene.groups.bgOptions      = scene.add.group();
        scene.groups.coins          = scene.add.group();
        scene.groups.upgrades       = scene.add.group();

        scene.groups.additionBlackBGs = scene.add.group();
    },

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
    available: ['batmanLego','starWarsLego', 'dragonsRR', 'toyStory','addition','subtraction','floorIsLava','ghostbusters'],
    fileName: ['batman','starWarsLego','dragons','toyStory','addition','subtraction','floorIsLava','ghostbusters'],
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
        let gV = vars.game; let cV = vars.cards; let pV = vars.player;

        // reset all save vars so the unlocks work properly
        if (lS.match2_resetData===undefined) { lV.resetAll(); }

        if (lS.match2_selectedGame===undefined) {
            lS.match2_selectedGame='batmanLego';
            lS.match2_best=999; lS.match2_bgColour='2,0'; gV.bestScore=999;
        } else {
            gV.bestScore=parseInt(lS.match2_best); vars.imageSets.current = lS.match2_selectedGame;
        }

        // updates since caleb first played the game
        // backgrounds
        if (lS.match2_bgColour===undefined) { lS.match2_bgColour='2,0'; } else { gV.bgColour= lS.match2_bgColour; }

        // difficulty
        if (lS.match2_difficulty===undefined) { lS.match2_difficulty='veryEasy'; } else { gV.difficulty = lS.match2_difficulty; }

        // score system (ie coins)
        if (lS.match2_playerScoreEVE===undefined) {
            lS.match2_playerScoreEVE=0; lS.match2_playerScoreNH=0; gV.score = 0;
        } else {
            if (gV.difficulty.toLowerCase().includes('easy')) { gV.score = parseInt(lS.match2_playerScoreEVE); } else { gV.score = parseInt(lS.match2_playerScoreNH); }
        }

        // unlocks
        if (lS.match2_unlocks===undefined) {
            lS.match2_unlocks='';
        } else {
            cV.unlockedStr = ''; cV.unlocked = [];
            let unlocks = lV.convertLSunlocks(lS.match2_unlocks);
            cV.unlocks = unlocks; cV.unlockedToStr();
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
            if (lS.match2_bonusGiven!==cDate) { gV.firstGame = true; } else { gV.firstGame = false; }
        }

        // player name
        if (lS.match2_playerName===undefined) { lS.match2_playerName='Caleb'; } else { pV.name = lS.match2_playerName }

        // 12+
        if (lS.match2_12===undefined) {
            lS.match2_12=false;
        } else {
            pV.age12 = lS.match2_12 === "false" ? false: true; // conversion from string to bool
        }

        // 15+
        if (lS.match2_15===undefined) { lS.match2_15=false; } else { pV.age15 = lS.match2_15 === "false" ? false: true; }

        // Birthday
        if (lS.match2_seenCake===undefined) { lS.match2_seenCake=false; } else { pV.bDay.seen=(lS.match2_seenCake==='true'); }
        lV.seenCake();
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
        let newCardData = _cardName + ',' + _cardID + ';';
        if (!lS.match2_unlocks.includes(newCardData)) {
            lS.match2_unlocks+=newCardData;
        } else {
            console.error('This card has already been unlocked!\nIgnoring request');
        }
    },

    seenCake: ()=> {
        let lS = window.localStorage;
        let bV = vars.player.bDay;

        // get todays date
        let today = getDates();
        if (today[0]===true && bV.seen===false) {
            let rel = 'have';
            switch (today[1]) {
                case 'Yesterday': rel='had'; break;
            }
            // set the local storage var to seen
            lS.match2_seenCake=true;
            bV.seen = 'enabled';
            bV.when = today[1];
            bV.relativity = rel;
            bV.relativityText = `Hope you ${rel} an awesome birthday, Caleb!`;
        } else if (bV.seen===false) {
            bV.seen = "disabled";
        } else if (bV.seen===true) {
            if (today[1]==='Today' || today[1]==='Tomorrow' || today[1]==='Yesterday') {
                bV.seen=true;
            }
        }
    },

    updateAge12: function() {
        // enables/disables Age 12 restrictions
        let message = '';
        if (vars.player.age12===false) {
            vars.player.age12 = true;
            window.localStorage.match2_12=true;
            message = "Age 12 CONFIRMED";
        } else {
            vars.player.age12 = false;
            window.localStorage.match2_12=false;
            message = "Age 12 DISABLED";
        }
        let a = scene.add.bitmapText(vars.canvas.width-10, 60, 'default', message, 48).setOrigin(1).setAlpha(0).setDepth(100);
        scene.tweens.add({ targets: a, alpha: 1, duration: 500, yoyo: true, hold: 3000, onComplete: (_tween, _object)=> { _object[0].destroy(); } })
    },

    updateAge15: function() {
        // enables/disables Age 12 restrictions
        let message = '';
        if (vars.player.age15===false) {
            vars.player.age15 = true;
            window.localStorage.match2_15=true;
            message = "Age 15 CONFIRMED";
        } else {
            vars.player.age15 = false;
            window.localStorage.match2_15=false;
            message = "Age 15 DISABLED";
        }
        let a = scene.add.bitmapText(vars.canvas.width-10, 60, 'default', message, 48).setOrigin(1).setAlpha(0).setDepth(100);
        scene.tweens.add({ targets: a, alpha: 1, duration: 500, yoyo: true, hold: 1000, onComplete: (_tween, _object)=> { _object[0].destroy(); } })
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
            if (valid===true) { lS.match2_selectedGame=_cardSet; needsReset=true; vars.imageSets.current=_cardSet; } else { return false; }
            // we need to delete the old cardBack and Alt
            for (image of vars.files.destroy.images) { scene.textures.removeKey(image); }
            for (sound of vars.files.destroy.sounds) { scene.cache.audio.remove(sound); }
            if (needsReset===true) { vars.game.reset(); } else { return false; }
        } else {
            return false;
        }
    }
}