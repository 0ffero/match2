if (vars.DEBUG===true) { console.log('Initialising...'); }

var config = {
    title: "Match 2",
    type: Phaser.WEBGL,

    backgroundColor: '#000000',
    disableContextMenu: true,

    height: vars.canvas.height,
    width: vars.canvas.width,
    parent: 'spaceInvasion',

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
    scene.load.setPath('assets');

    // Check the local storage
    vars.localStorage.init();

    vars.files.loadAssets();

    // Particles
    scene.load.image('spark0', 'particles/blue.png');
    scene.load.image('spark1', 'particles/red.png');

    // UI
    scene.load.image('background', 'images/backgroundWhite.jpg');
    scene.load.image('bgColour', 'images/bgColourDefault.png');
    scene.load.atlas('gameButtons', 'images/gameButtons.png', 'images/gameButtons.json');
    scene.load.atlas('fullScreenButton', 'images/fullScreen.png', 'images/fullScreen.json');
    scene.load.image('optionsButton', 'images/options.png');
    scene.load.image('restartButton', 'images/reload.png');
    scene.load.image('whitePixel', 'images/whitePixel.png');

    scene.load.html('nameform', 'html/nameform.html');

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

    scene.groups = {};
    scene.groups.cardsGroup = scene.add.group();
    scene.groups.cardBacksGroup = scene.add.group();
    scene.groups.foundGroup = scene.add.group(); // unused
    scene.groups.bgOptions = scene.add.group();

    // DRAW GAME BOARD
    vars.game.init();

    // INPUT
    vars.input.init();

    // Flip all the cards face down
    vars.cards.allFaceDown();

    // UI
    vars.UI.draw();

}