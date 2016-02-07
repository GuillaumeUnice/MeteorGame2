/**
 * Created by Falou on 29/01/2016.
 * Based on Seb's joystick for Ipad. It handles the moves on digital devices mainly phones or tablets
 */
var halfWidth, leftPointerID = -1, leftPointerPos = new Vector2(0, 0), leftPointerStartPos = new Vector2(0, 0), leftVector = new Vector2(0, 0);

var pointers, _baseX = 0, _stickX = 0, _baseY = 0, _stickY = 0, _pressed = false, _stationaryBase = false;

var pointer_x = 0, previous_pointer_x = 0, pointer_y, previous_pointer_y;

// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.onorientationchange = resetCanvas;
window.onresize = resetCanvas;

document.addEventListener("DOMContentLoaded", init);

function init() {
    setupCanvas();
    pointers = new Collection();
    gameCanvas.addEventListener('pointerdown', onPointerDown, false);
    gameCanvas.addEventListener('pointermove', onPointerMove, false);
    gameCanvas.addEventListener('pointerup', onPointerUp, false);
    gameCanvas.addEventListener('pointerout', onPointerUp, false);
    requestAnimFrame(drawTouch);
}

function resetCanvas() {
    halfWidth = gameCanvas.width / 2;
    //make sure we scroll to the top left.
    window.scrollTo(0, 0);
}

var drawPointer = function (x, y, radius, strokeStyle, lineWidth) {
    graph.beginPath();
    graph.strokeStyle = strokeStyle;
    graph.lineWidth = lineWidth;
    graph.arc(x, y, radius, 0, Math.PI * 2, true);
    graph.stroke();
};

function drawTouch() {
    graph.clearRect(0, 0, screenWidth, screenHeight);
    graph.fillStyle = "#000000";
    graph.fillRect(0, 0, screenWidth, screenHeight);

    pointers.forEach(function (pointer) {
        graph.globalAlpha = 0.7;

        //       if (pointer.identifier == leftPointerID) {
        //         drawPointer(leftPointerStartPos.x, leftPointerStartPos.y, 40, "white", 6);
        //       drawPointer(leftPointerStartPos.x, leftPointerStartPos.y, 60, "white", 2);
        //     drawPointer(leftPointerPos.x, leftPointerPos.y, 40, "white", 2);

        //} else {
        drawPointer(pointer.x, pointer.y, 40, "red", 2);
        //}
    });

    requestAnimFrame(drawTouch);
}

function givePointerType(event) {
    switch (event.pointerType) {
        case event.POINTER_TYPE_MOUSE:
            return "MOUSE";
            break;
        case event.POINTER_TYPE_PEN:
            return "PEN";
            break;
        case event.POINTER_TYPE_TOUCH:
            return "TOUCH";
            break;
    }
}

function onPointerDown(e) {
    e.preventDefault();
    _pressed = true;


    var newPointer = {identifier: e.pointerId, x: e.clientX, y: e.clientY, type: givePointerType(e)};
    if ((leftPointerID < 0) && (e.clientX < halfWidth)) {
        leftPointerID = e.pointerId;
        leftPointerStartPos.reset(e.clientX, e.clientY);
        leftPointerPos.copyFrom(leftPointerStartPos);
        leftVector.reset(0, 0);
    }

    if (_stationaryBase == false) {
        _baseX = e.clientX;
        _baseY = e.clientY;
    }

    _stickX = e.clientX;
    _stickY = e.clientY;

    pointers.add(e.pointerId, newPointer);
    if (!player.isRegrouped.value) {
        pointer_x = e.clientX;
        pointer_y = e.clientY;


        player.isRegrouped.pointer_left = (pointer_x < screenWidth / 2);
        player.isRegrouped.pointer_right = (pointer_x > screenWidth / 2);
        player.isRegrouped.pointer_up = (pointer_y < screenHeight / 2);
        player.isRegrouped.pointer_down = (pointer_y > screenHeight / 2);

        if (pointer_x > screenWidth / 2)
            console.log('Right');

        if (pointer_x < screenWidth / 2)
            console.log('Left');

        if (pointer_y < screenHeight / 2)
            console.log('Up');

        if (pointer_y > screenHeight / 2)
            console.log('Down');


        previous_pointer_x = pointer_x;
        previous_pointer_y = pointer_y;
    }

}

function onPointerMove(e) {

    if (_pressed) {

        if (leftPointerID == e.pointerId) {
            leftPointerPos.reset(e.clientX, e.clientY);
            leftVector.copyFrom(leftPointerPos);
            leftVector.minusEq(leftPointerStartPos);
        }
        else {
            if (pointers.item(e.pointerId)) {
                pointers.item(e.pointerId).x = e.clientX;
                pointers.item(e.pointerId).y = e.clientY;
            }
        }

        _stickX = e.clientX;
        _stickY = e.clientY;

        if (right) {
            imageRepository.playerImg.src = imageRepository.player_right;
        }
        if (left()) {
            imageRepository.playerImg.src = imageRepository.player_left;
        }
        if (down()) {
            imageRepository.playerImg.src = imageRepository.player_down;
        }
        if (up()) {
            imageRepository.playerImg.src = imageRepository.player_up;
        }


        target.x = e.clientX - screenWidth / 2;
        target.y = e.clientY - screenHeight / 2;

        console.log('Target changed again');
    }
}
function onPointerUp(e) {


    console.log('Your finger just got up');
    _pressed = false;
    target.x = 0;
    target.y = 0;

    if (leftPointerID == e.pointerId) {
        leftPointerID = -1;
        leftVector.reset(0, 0);

    }

    leftVector.reset(0, 0);
    if (!_stationaryBase) {
        this._baseX = this._baseY = 0;
        this._stickX = this._stickY = 0;
    }
    pointers.remove(e.pointerId);
    directionLock = true;
}

function __deltaX() {
    return _stickX - _baseX;
}

function __deltaY() {
    return _stickY - _baseY;
}

var right = function () {
    if (_pressed === false)    return false;
    var deltaX = __deltaX();
    var deltaY = __deltaY();
    if (deltaX <= 0)                return false;
    return Math.abs(deltaY) <= 2 * Math.abs(deltaX);

};

var up = function () {
    if (_pressed === false)    return false;
    var deltaX = __deltaX();
    var deltaY = __deltaY();
    if (deltaY >= 0)                return false;
    return Math.abs(deltaX) <= 2 * Math.abs(deltaY);

};

var down = function () {
    if (_pressed === false)    return false;
    var deltaX = __deltaX();
    var deltaY = __deltaY();
    if (deltaY <= 0)                return false;
    return Math.abs(deltaX) <= 2 * Math.abs(deltaY);

};

var left = function () {
    if (_pressed === false)    return false;
    var deltaX = __deltaX();
    var deltaY = __deltaY();
    if (deltaX >= 0)                return false;
    return Math.abs(deltaY) <= 2 * Math.abs(deltaX);

};

function setupCanvas() {
    resetCanvas();
    graph.strokeStyle = "#ffffff";
    graph.lineWidth = 2;
}