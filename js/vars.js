var vars = {
    DEBUG: true,

    canvas: {
        width: 1920,
        height: 1080,
        cX: 1920/2,
        cY: 1080/2,
    },

    imageSets: {
        available: ['batmanLego'],
        current: 'batmanLego'
    },

    animate: {
        cardsToFound: function(_cardNumber) {
            console.log('Spinning the cards to the found area');
            let cardA = scene.children.getByName('card_' + _cardNumber + '_a');
            cardA.setDepth(2);
            let cardB = scene.children.getByName('card_' + _cardNumber + '_b');
            cardB.setDepth(1).setTint(0x888888);

            let cV = vars.cards;
            let spinToCol = _cardNumber%3; // col 0, 1 or 2
            let spinToRow = ~~(_cardNumber/3); // row 0, 1 or 2
            let x = cV.spinToOffsets[0] + (spinToCol * (cV.cardWidth/2+60));
            let y = cV.spinToOffsets[1] + (spinToRow * (cV.cardHeight/2+60));

            let rndAngle = Math.random()*0.5*Phaser.Math.RND.sign();
            rndAngle = ~~(rndAngle*1000)/1000;
            rndAngle += Math.PI*3;
            if (vars.DEBUG===true) { console.log('rndAngle: ' + rndAngle); }
            scene.tweens.add({
                targets: cardA,
                x: x,
                y: y,
                scale: 0.5,
                rotation: Math.PI*3+rndAngle,
                ease: 'Cubic.easeOut',
                duration: 3000,
            });
            scene.tweens.add({
                targets: cardB,
                x: x+10,
                y: y+10,
                scale: 0.5,
                rotation: Math.PI*3+rndAngle,
                ease: 'Cubic.easeOut',
                duration: 3000,
            });
        },

        toDefaultState: function() {
            let cV = vars.cards;
            let selected = cV.selected;
            let selectedPair = cV.selectedPair;

            let card1Name = 'card_' + selected[0][0] + '_' + selectedPair[0];
            let back1Name = 'back_' + selected[0][0] + '_' + selectedPair[0];

            let card2Name = 'card_' + selected[1][0] + '_' + selectedPair[1];
            let back2Name = 'back_' + selected[1][0] + '_' + selectedPair[1];

            let card1 = scene.children.getByName(card1Name);
            let back1 = scene.children.getByName(back1Name);
            let card2 = scene.children.getByName(card2Name);
            let back2 = scene.children.getByName(back2Name);

            let duration = vars.cards.spinDuration/2;

            scene.tweens.add({
                targets: [card1,card2],
                scaleX: 0,
                duration: duration
            })
            scene.tweens.add({
                targets: [back1,back2],
                delay: duration,
                scaleX: 1,
                duration: duration
            })
        }
    },

    cards: {
        cardArray: [],
        cardPosArray: [],
        cardWidth: 200,
        cardHeight: 260,
        spinDuration: 500,
        spinToOffsets: [1450,150],
        selected: [],
        selectedPair: [],

        addCardToSelected: function(_tween,_card) {
            let cV = vars.cards;
            cV.selected.push(_card[0].getData('cardID'));
            cV.selectedPair.push(_card[0].getData('pair'));
            if (cV.selected.length===2) { // 2nd card has been clicked
                vars.checkForPair();
            }
        },

        showCardBacks: function() {
            // set all backs to visible
            scene.groups.cardBacksGroup.children.each( (c)=> {
                c.setVisible(true);
                let duration = vars.cards.spinDuration/2;
                scene.tweens.add({
                    targets: c,
                    scaleX: 1,
                    duration: duration
                })
            })
        },

        showThisCard: function(_card) {
            console.log('Showing This card');
            let cardName = _card.name; // this is the back of the card
            cardName = cardName.match(/\w+_([0-9])_([ab])/);
            cardName = 'card_' + cardName[1] + '_' + cardName[2];
            if (vars.DEBUG===true) { console.log('Looking for ' + cardName); }
            let card = scene.children.getByName(cardName);

            let duration = vars.cards.spinDuration/2;

            // we now have the back of the card as "_card" and the front as "card"
            scene.tweens.add({
                targets: _card,
                scaleX: 0,
                duration: duration
            })
            scene.tweens.add({
                targets: card,
                delay: duration,
                scaleX: 1,
                duration: duration,
                onComplete: vars.cards.addCardToSelected,
                onCompleteParams: [ card ]
            })

        }
    },

    checkForPair: function() {
        console.log('Checking for pair...');
        let cV = vars.cards;

        // do we have a pair?
        let card1 = cV.selected[0][0];
        let card2 = cV.selected[1][0];
        if (card1===card2) { // YES
            // send the 2 cards to the found group
            if (vars.DEBUG===true) { console.log('Pair found!'); }
            vars.animate.cardsToFound(card1);
        } else { // NO
            // turn the 2 cards back over
            if (vars.DEBUG===true) { console.log('This ISNT a pair :('); }
            vars.animate.toDefaultState();
        }

        // next empty out the selected array
        cV.selected=[];
        cV.selectedPair=[];
    }

}