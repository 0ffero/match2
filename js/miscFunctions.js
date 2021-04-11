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
    if (vars.player.age12) console.log('💿 12+ 🗸');
    if (vars.player.age15) console.log('📀 15+ 🗸');
}