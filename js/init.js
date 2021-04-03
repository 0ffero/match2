if (vars.DEBUG===true) { console.log('Initialising...'); }

var config = {
    title: "Match 2",
    type: Phaser.WEBGL,

    backgroundColor: '#000000',
    disableContextMenu: true,

    height: vars.canvas.height,
    width: vars.canvas.width,
    parent: 'Match2',

    dom: {
        createContainer: true
    },

    scale: {
        parent: 'Match 2',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: vars.canvas.width,
        height: vars.canvas.height,
    },

    scene: {
        preload: preload,
        create: create,
        update: main,
        pack: {
            files: [
                { type: 'image', key: 'loadingImage', url: 'assets/images/introScreen.jpg' }
            ]
        }
    }
};

var game = new Phaser.Game(config);


/*
█████ ████  █████ █      ███  █████ ████  
█   █ █   █ █     █     █   █ █   █ █   █ 
█████ ████  ████  █     █   █ █████ █   █ 
█     █   █ █     █     █   █ █   █ █   █ 
█     █   █ █████ █████  ███  █   █ ████  
*/
function preload() {
    scene = this;
    scene.add.image(vars.canvas.cX, vars.canvas.cY, 'loadingImage')
    scene.load.setPath('assets');

    // Check the local storage
    vars.localStorage.init();

    vars.files.loadAssets();

    // Particles
    scene.load.image('spark0', 'particles/blue.png');
    scene.load.image('spark1', 'particles/red.png');

    // UI
    scene.load.image('background',       'images/backgroundWhite.jpg');
    scene.load.image('bgColour',         'images/bgColourDefault.png');
    scene.load.atlas('gameButtons',      'images/gameButtons.png',  'images/gameButtons.json');
    scene.load.atlas('fullScreenButton', 'images/fullScreen.png',   'images/fullScreen.json');
    scene.load.image('optionsButton',    'images/options.png');
    scene.load.image('restartButton',    'images/reload.png');
    scene.load.image('whitePixel',       'images/whitePixel.png');
    scene.load.atlas('coinG',            'images/coins.png',        'images/coins.json');
    scene.load.atlas('coinS',            'images/coinsS.png',       'images/coinsS.json');

    scene.load.html('nameform', 'html/nameForm.html');

    // VIDEO
    //scene.load.video('introVideo', 'video/batman.mp4'); <--- this doesnt exist, but for future reference
}



/*
█████ ████  █████ █████ █████ █████ 
█     █   █ █     █   █   █   █     
█     ████  ████  █████   █   ████  
█     █   █ █     █   █   █   █     
█████ █   █ █████ █   █   █   █████ 
*/
function create() {
    vars.cards.buildDefaultArrays();
    vars.imageSets.init();

    let numbersGame = false;
    let lS = window.localStorage;
    if (lS.match2_selectedGame==='addition' || lS.match2_selectedGame==='subtraction') { numbersGame = true; }

    scene.groups = {};
    scene.groups.cardsGroup     = scene.add.group();
    scene.groups.cardBacksGroup = scene.add.group();
    scene.groups.foundGroup     = scene.add.group(); // unused
    scene.groups.bgOptions      = scene.add.group();
    scene.groups.coins          = scene.add.group();
    scene.groups.upgrades       = scene.add.group();

    scene.groups.additionBlackBGs = scene.add.group();

    // DRAW GAME BOARD
    if (numbersGame === false) { vars.game.drawCards(); } else { vars.cards.createAdditionPairs(); }

    // INPUT
    vars.input.init();

    // ANIMATIONS
    vars.animate.init();

    if (numbersGame===false) {
        // Flip all the cards face down
        vars.cards.allFaceDown();
    }

    // UI
    vars.UI.init();
}