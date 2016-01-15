var cats = {};

var i = true;


Leap.loop(function (frame) {
    frame.hands.forEach(function (hand, index) {

        // stopDeplacement = false;

        console.log(hand.screenPosition());

        /*if (!directionLock) {
         var x = Math.floor((Math.random() * 2) + 1);
         console.log(x);*/

        if (hand.screenPosition()[0] >= 700) {
            target.x = 200;
            target.y = 0;
        } else {
            target.x = -200;
            target.y = 0;
        }

        // setTimeout(function(){ stopDeplacement = true; }, 200);

    });

}).use('screenPosition', {scale: 0.25});


var Cat = function () {
    var cat = this;
    var img = document.createElement('img');
    img.src = 'vaisseaux.png';
    img.style.position = 'absolute';
    img.id ='vaisseau';

    img.onload = function () {
        cat.setTransform([window.innerWidth / 2, window.innerHeight / 2], 0);
        document.body.appendChild(img);
    };

    cat.setTransform = function (position, rotation) {

        img.style.left = position[0] - img.width / 2 + 'px';
        img.style.top = position[1] - img.height / 2 + 'px';

        img.style.transform = 'rotate(' + -rotation + 'rad)';

        img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
            img.style.OTransform = img.style.transform;

    };

};

cats[0] = new Cat();

// This allows us to move the cat even whilst in an iFrame.
Leap.loopController.setBackground(true);