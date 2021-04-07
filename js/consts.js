const consts = {
    // difficulty constants
    veryEasy: {
        points: {
            //     [low prize --------------------- best prize]
            //       >40  <=39  <=29   <=19    13   <=12,  9
            prize: [  20,   40,   100,   150,  200,   300, 500]
            // coinsS:10    20     50     75   100    150  250
            // CoinsG: 0     0      0      0    40     60  100
        },
        cardBacks: ['cardBack', 'cardBackAlt'],
        cardCost: 100,
        coinForPair: 'S',
        coinWorthG: 5, // only used for wins <=12 (as youd need 150/250 silver coins)
        coinWorthS: 2,
        pairWorth: 2
    },
    easy: {
        points: {
            //     [low prize --------------------- best prize]
            //       >40  <=39  <=29   <=19    13   <=12,  9
            prize: [  20,   40,   100,   150,  200,   300, 500]
            // coinsS:10    20     50     75   100    150  250
            // CoinsG: 0     0      0      0    40     60  100
        },
        cardBacks: ['cardBack', 'cardBack'],
        cardCost: 100,
        coinForPair: 'S',
        coinWorthG: 5, // only used for wins <=12 (as youd need 150/250 silver coins)
        coinWorthS: 2,
        pairWorth: 2
    },
    normal: {
        points: {
            prize:    [100, 200, 250, 500, 1500, 2000, 5000]
            // coinsS   20   40   50  100,  300   400  1000]
            // coinsG   10   20   25   50   150   200   500!
        },
        cardBacks: ['cardBack', 'cardBack'],
        cardCost: 1000,
        coinForPair: 'G',
        coinWorthG: 10,
        coinWorthS: 5,
        pairWorth: 20
    },
    hard: {
        points: {
            prize: [   100, 100, 100, 200, 500,  1000, 2000]
            // coinsS   20   20   20   40  100    200   400]
            // coinsG   10   10   10   20   50    100   200
        },
        cardBacks: ['cardBack', 'cardBack'],
        cardCost: 1000,
        coinForPair: 'G',
        coinWorthG: 10,
        coinWorthS: 5,
        pairWorth: 10
    },

    console: {
        functionInit: 'font-size: 16px; color: green;',
    },

    depths: {
        snow: 100,
        options: 30,
        unlock: 20,
        coins: 10,
        game: 5,
        additionBG: 2,
        gameBG: 1,
    },

    convertMovesToPrize: function() {
        let prize=0;
        let gV = vars.game;
        let difficulty = gV.difficulty;
        let cDif = consts[difficulty];
        if (gV.moves===9) { // no cheating!
            prize = cDif.points.prize[6];
        } else if (gV.moves<=12) {
            prize = cDif.points.prize[5];
        } else if (gV.moves===13) {
            prize = cDif.points.prize[4];
        } else if (gV.moves<=19) {
            prize = cDif.points.prize[3];
        } else if (gV.moves<=29) {
            prize = cDif.points.prize[2];
        } else if (gV.moves<=39) {
            prize = cDif.points.prize[1];
        } else if (gV.moves>=40) {
            prize = cDif.points.prize[0];
        }

        let cWorthG = cDif.coinWorthG; let cWorthS = cDif.coinWorthS;
        let coinData = consts.convertPrizeToCoins(cWorthG, cWorthS, prize);

        if (prize>0) {
            vars.animate.coinsGenerate(coinData);
        } else {
            console.warn('WARNING!\nApparently you completed the game in ' + gV.moves + ' moves. Your prize is: ' + prize);
        }
    },

    convertPrizeToCoins: function(_gold, _silver, _prize) {
        if (vars.DEBUG===true) { console.log('Prize: ' + _prize + ' (s:' + _silver + ', g:' + _gold + ')'); }
        let oPrize = _prize;

        let gV = vars.game;
        if (gV.score + _prize<100 && gV.firstGame===true) {
            _prize = 100-gV.score;
            vars.localStorage.bonusGiven();
        }

        // figure out the amount of silver and gold coins needed
        sCoins = 0;
        if (_prize/_silver>=100) {
            if (vars.DEBUG===true) { console.log('Generating Gold And Silver'); }
            sCoins=40; sWorth = sCoins*_silver; _prize -= sWorth; gCoins = _prize/_gold;
        } else {
            if (vars.DEBUG===true) { console.log('Generating Silver'); }
            gCoins=0; sCoins = _prize/_silver;
        }

        if (vars.DEBUG===true) { console.log(gCoins + ' gold pieces + ' + sCoins + ' silver pieces needed'); }

        let tCoins = gCoins + sCoins;

        // set up the duration, delay and coin volume vars (more coins generate cause more coins to ping around the same time, causing a louder perceived volume, so volume needs to be tuned based on coin count)
        let duration = 3; let delay = 5;
        let aV = vars.audio;
        aV.volumeOfCoins=0.2;
        if (tCoins >=400) { aV.volumeOfCoins=0.03; delay = 0.5; } else if (tCoins >=200) { aV.volumeOfCoins=0.05; delay = 1.5; } else if (tCoins >=100) { aV.volumeOfCoins=0.1; delay = 2; }
        if (tCoins>=100) { duration = 2; }
        duration*=1000;

        if (vars.DEBUG===true) { console.log('Delay: ' + delay + '. Duration: ' + duration); }
        return { g: gCoins, s: sCoins, gW: _gold, sW: _silver, duration: duration, delay: delay, prize: oPrize }
    },

    getTint: function(__score) {
        let tint = 0xffffff;
        let fontData = vars.files.getFileData().font;
        let fontName = fontData[0];
        if (__score >= vars.cards.getCardCost() && fontName!=='toyStoryFont') { tint = 0xffff00; }
        return tint;
    }
}