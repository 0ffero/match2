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

    // CARDS
    scene.load.spritesheet('batmanLego', 'imageSets/batmanLego-ext.png', { frameWidth: 200, frameHeight: 260, margin: 1, spacing: 2  });
    scene.load.image('cardBack', 'images/cardBack.png');
    scene.load.image('cardBackAlt', 'images/cardBackSilver.png'); // these are used to distinguish between cards a and b. ie it makes the game easier if theyre used

    // SOUNDS
    //scene.load.audio('enemyShoot',       'audio/enemyBlaster.ogg');

    // UI
    scene.load.image('background', 'images/backgroundBlue.jpg');

    // VIDEO
    //scene.load.video('introVideo', 'video/spaceinvaders.mp4');
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

    // INPUT
    scene.input.on('gameobjectdown', function (pointer, card) {
        if (card.name.includes('back')) {
            vars.cards.showThisCard(card);
        }
    });

    // Flip all the cards face down
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
}