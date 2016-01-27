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


var Cat = function () {
    var cat = this;
};

cats[0] = new Cat();
