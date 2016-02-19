/***
 * This file allows to control the super vessel with the LeapMotion
 * @type {{}}
 */

var cats = {};

function setLeap(frame) {
    frame.hands.forEach(function (hand, index) {

        if (hand.screenPosition()[0] >= 700) {
            target.x = 200;
        } else {
            target.x = -200;
        }

    });

}


var Cat = function () {
    var cat = this;
};

cats[0] = new Cat();

