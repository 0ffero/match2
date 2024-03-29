function multiLoader(files) {
    let images = files.images;
    let cardType = files.cardType;
    let cards = files.cards[cardType];

    // Load images
    if (vars.DEBUG===true) { console.log('Loading Images...'); }
    for (image of images) {
        if (vars.DEBUG===true) { console.log('Name: ' + image[0] + '. File: ' + image[1]); }
        scene.load.image(image[0], image[1]);
    }

    // Load UI stuff
    scene.load.spritesheet('difficultyButtons', 'images/difficultyButtons-ext.png', { frameWidth: 350, frameHeight: 80, margin: 1, spacing: 2 })

    // Load the cards
    let name = cards[0]; let file = cards[1]; let json = cards[2];
    scene.load.atlas(name, file, json);

    // particles
    multiLoaderParticles();

    // Load the fonts
    multiLoaderFonts(files);

    // Load sounds
    let sounds = files.sounds;
    multiLoaderSounds(sounds);
}

function multiLoaderFonts(files) {
    let font = files.font;
    let skip = false;
    if (scene.sys.cache.bitmapFont.get(font[0])===undefined) {
        // in general each card set has its own font so loading them all would be wasteful.
        // however addition etc all use the same font. if its passed in here the bottom check
        // will be ignored. 
        // As fonts dont become available until theyre loaded, we specifically set the skip var.
        // Meaning that if a numbers game is initially selected it will fire here. If its, say,
        // ghostbusters, it still loads in the numbers font below.
        scene.load.bitmapFont(font[0] , font[1], font[2]);
        if (font[0]==='numbersFont') { skip=true; }
    }
    if (scene.sys.cache.bitmapFont.get('default')===undefined) {
        scene.load.bitmapFont('default', 'fonts/default.png', 'fonts/default.xml');
    }
    if (scene.sys.cache.bitmapFont.get('xmasFont')===undefined) {
        scene.load.bitmapFont('xmasFont', 'fonts/xmasFont.png', 'fonts/xmasFont.xml');
    }
    if (scene.sys.cache.bitmapFont.get('numbersFont')===undefined && skip===false) {
        // we currently have 2 numbers games which use this font, but it will eventually
        // be 4 so we cache it now so jumping from game to game is a little faster
        scene.load.bitmapFont('numbersFont', 'fonts/numbersFont.png', 'fonts/numbersFont.xml');
    }
}

function multiLoaderNumbers(mathType=null) {
    if (mathType===null) { return false; }
    let files = vars.files[mathType];

    // Initialise the backgrounds
    vars.files.backgrounds.init();

    // particles
    multiLoaderParticles();

    // Load the fonts
    multiLoaderFonts(files);

    // load the cards
    scene.load.spritesheet('cardNumbers', 'imageSets/numbers-ext.png', { frameWidth: 200, frameHeight: 260, margin: 1, spacing: 2 } )
    scene.load.spritesheet('cardBacks', 'images/additionBG.png', { frameWidth: 180, frameHeight: 240, margin: 0, spacing: 0 } )

    // Load UI stuff
    scene.load.spritesheet('difficultyButtons', 'images/difficultyButtons-ext.png', { frameWidth: 350, frameHeight: 80, margin: 1, spacing: 2 })

    // load extra images
    scene.load.image('warningBG', 'images/warningBG.png');

    // load the sounds
    let sounds = files.sounds;
    multiLoaderSounds(sounds);
}

function multiLoaderParticles() {
    scene.load.atlas('flares', 'particles/flares.png', 'particles/flares.json');
    scene.load.spritesheet('snowSpritesSmall', 'particles/snowflakes.png', { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 });
    scene.load.spritesheet('snowSpritesLarge', 'particles/snowflakes_large.png', { frameWidth: 64, frameHeight: 64, margin: 0, spacing: 0 });
}

function multiLoaderSounds(_sounds) {
    // Load "yes" sounds
    let aV = vars.audio;
    aV.no=[]; aV.yes=[]; aV.noUsed=[]; aV.yesUsed=[]; aV.win=null;
    let sV = vars.files.destroy.sounds;
    console.groupCollapsed('Loading audio files...');
    for (good of _sounds.good) {
        let name = good.replace('.ogg','');
        scene.load.audio(name, 'audio/' + good);
        if (vars.DEBUG===true) { console.log('Name: ' + name + ', File: ' + good); }
        aV.yes.push(name);
        sV.push(name);
    }

    // Load "no" sounds
    for (bad of _sounds.bad) {
        let name = bad.replace('.ogg','');
        scene.load.audio(name, 'audio/' + bad);
        if (vars.DEBUG===true) { console.log('Name: ' + name + ', File: ' + bad); }
        aV.no.push(name);
        sV.push(name);
    }
    console.groupEnd();

    // Load "win" sound
    let win = _sounds.win;
    vars.audio.win = 'win';
    scene.load.audio('win', 'audio/' + win);
    sV.push('win');

    // Load other sounds
    for (file of vars.files.audio.others) {
        scene.load.audio(file[0], file[1]);
    }

    // Randomise the "yes" and "no" sounds
    if (aV.no.length>0) { shuffle(aV.no); }
    if (aV.yes.length>0) { shuffle(aV.yes); }
}

function multiLoaderVideo() {
    
}