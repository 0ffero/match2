if (vars.DEBUG===true) { console.log('Initialising...'); }
init();

var config = {
    title: "Match 2",
    type: Phaser.WEBGL,

    backgroundColor: '#000000',
    disableContextMenu: true,

    height: vars.canvas.height,
    width: vars.canvas.width,
    parent: 'spaceInvasion',

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

function init() {
    vars.cards.cardArray = Phaser.Utils.Array.NumberArray(0,8); // 9 individual cards in each set
    vars.cards.cardPosArray = Phaser.Utils.Array.NumberArray(0,17); // <-- total positions = 18
}


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

    scene.load.bitmapFont('batFont', 'fonts/batFont.png', 'fonts/batFont.xml');

    vars.files.loadAssets();

    // UI
    scene.load.image('background', 'images/backgroundBlue.jpg');
    scene.load.atlas('fullScreenButton', 'images/fullScreen.png', 'images/fullScreen.json');

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
    scene.groups = {};
    scene.add.image(vars.canvas.cX, vars.canvas.cY, 'background');
    scene.groups.cardsGroup = scene.add.group();
    scene.groups.cardBacksGroup = scene.add.group();
    scene.groups.foundFroup = scene.add.group();

    // DRAW GAME BOARD
    vars.game.init();

    // INPUT
    vars.input.init();

    // Flip all the cards face down
    vars.cards.allFaceDown();

    // Full Screen Icon
    scene.add.image(1840,1000, 'fullScreenButton').setName('fullScreenButton').setData('fullScreen','false').setInteractive();

    // Show the welcome message
    scene.add.bitmapText(50, 900, 'batFont', 'Welcome to Match 2, Caleb\n\nLego Batman Edition', 52, 1).setScale(0.9,1)
}