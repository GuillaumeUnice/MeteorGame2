/***
 * This file allows to control the super vessel with the LeapMotion
 * @type {{}}
 */

var cats = {};

function setLeap(frame) {
    frame.hands.forEach(function (hand, index) {
        console.log(index);
        console.log(hand);
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


var Cat = function () {
    var cat = this;
};

cats[0] = new Cat();

