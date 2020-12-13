function multiLoader(files) {
    let images = files.images;
    let sounds = files.sounds;
    let cardType = files.cardType;
    let font = files.font;
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
    let name = cards[0]; let file = cards[1]; let width = cards[2]; let height = cards[3]; let margin = cards[4]; let spacing = cards[5];
    scene.load.spritesheet(name, file, { frameWidth: width, frameHeight: height, margin: margin, spacing: spacing })

    // Load the font
    scene.load.bitmapFont(font[0], font[1], font[2]);
    scene.load.bitmapFont('default', 'fonts/default.png', 'fonts/default.xml');

    // Load "yes" sounds
    let aV = vars.audio;
    aV.no=[]; aV.yes=[]; aV.noUsed=[]; aV.yesUsed=[]; aV.win=null;
    let sV = vars.files.destroy.sounds;
    for (good of sounds.good) {
        name = good.replace('.ogg','');
        scene.load.audio(name, 'audio/' + good);
        if (vars.DEBUG===true) { console.log('Name: ' + name + ', File: ' + good); }
        aV.yes.push(name);
        sV.push(name);
    }

    // Load "no" sounds
    for (bad of sounds.bad) {
        name = bad.replace('.ogg','');
        scene.load.audio(name, 'audio/' + bad);
        if (vars.DEBUG===true) { console.log('Name: ' + name + ', File: ' + bad); }
        aV.no.push(name);
        sV.push(name);
    }

    // Load "win" sound
    let win = sounds.win;
    vars.audio.win = 'win';
    scene.load.audio('win', 'audio/' + win);
    sV.push('win');

    // Load other sounds
    scene.load.audio('coinAdd', 'audio/coin.ogg');
    scene.load.audio('unlock', 'audio/unlock.ogg');
    scene.load.audio('cardTurn', 'audio/cardTurn.m4a');

    // Randomise the "yes" and "no" sounds
    if (aV.no.length>0) { shuffle(aV.no); }
    if (aV.yes.length>0) { shuffle(aV.yes); }

}
