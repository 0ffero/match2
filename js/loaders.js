/* function batmanLoader() {
    let files = vars.files.batman;
    let batmanImages = files.images;
    let bS = batmanSprites = files.cards.spritesheet;
    let batmanSounds = files.sounds;

    // load images
    if (vars.DEBUG===true) { console.log('Loading Images...'); }
    for (image of batmanImages) {
        if (vars.DEBUG===true) { console.log('Name: ' + image[0] + '. File: ' + image[1]); }
        scene.load.image(image[0], image[1]);
    }

    // Load the card sprites
    if (vars.DEBUG===true) { console.log('Name: ' + batmanSprites[0] + ', File: ' + batmanSprites[1] + ', Width: ' + batmanSprites[2] + ', Height: ' + batmanSprites[3] + ', Margin: ' + batmanSprites[4] + ', Spacing: ' + batmanSprites[5]); }
    let name = bS[0]; let file = bS[1]; let width = bS[2]; let height = bS[3]; let margin = bS[4]; let spacing = bS[5];
    scene.load.spritesheet(name, file, { frameWidth: width, frameHeight: height, margin: margin, spacing: spacing })

    // Load yes sounds
    let aV = vars.audio;
    for (good of batmanSounds.good) {
        name = good.replace('.ogg','');
        scene.load.audio(name, 'audio/' + good);
        if (vars.DEBUG===true) { console.log('Name: ' + name + ', File: ' + good); }
        aV.yes.push(name);
    }

    // load no sounds
    for (bad of batmanSounds.bad) {
        name = bad.replace('.ogg','');
        scene.load.audio(name, 'audio/' + bad);
        if (vars.DEBUG===true) { console.log('Name: ' + name + ', File: ' + bad); }
        vars.audio.no.push(name);
    }

    let win = batmanSounds.win;
    vars.audio.win = 'win';
    scene.load.audio('win', 'audio/' + win);

    // randomise the yes and no sounds
    shuffle(vars.audio.no);
    shuffle(vars.audio.yes);
} */

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

    // Randomise the "yes" and "no" sounds
    if (aV.no.length>0) { shuffle(aV.no); }
    if (aV.yes.length>0) { shuffle(aV.yes); }

}