String.prototype.capitalise = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function generateRandomID(_g=false) {
    generatedID = '';
    let maxC = 8;
    if (_g!==false) { maxC = 16; }
    for (let i=0; i<maxC; i++) {
        generatedID +=~~((Math.random()*9)+1).toString();
    }
    return generatedID;
}

limit = Phaser.Math.Clamp;

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

whatAgeAmI = ()=> {
    let message = '';
    if (vars.player.age12) message = '\n💿 12+ 🗸';
    if (vars.player.age15) message+= '\n📀 15+ 🗸';
    if (message.length===0) { message = '\n💿 12+ 🗙\n📀 15+ 🗙' }
    let a = scene.add.text(vars.canvas.width-10, -40, message).setFontSize(64).setOrigin(1,0).setAlpha(0).setDepth(100);
    scene.tweens.add({ targets: a, alpha: 1, duration: 500, yoyo: true, hold: 3000, onComplete: (_tween, _object)=> { _object[0].destroy(); } })
}