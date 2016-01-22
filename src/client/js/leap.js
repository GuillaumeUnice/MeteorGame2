var cats = {};

var i = true;


function setLeap (frame) {
    frame.hands.forEach(function (hand, index) {

        console.log(hand.screenPosition());

        if (hand.screenPosition()[0] >= 700) {
            target.x = 200;
            target.y = 0;
        } else {
            target.x = -200;
            target.y = 0;
        }

    });

}

/*Leap.loop().use('screenPosition', {scale: 0.25});*/




var Cat = function () {
    var cat = this;
};

cats[0] = new Cat();

// This allows us to move the cat even whilst in an iFrame.
Leap.loopController.setBackground(true);