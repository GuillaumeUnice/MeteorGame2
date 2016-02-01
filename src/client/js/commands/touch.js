/**
 * Created by Falou on 29/01/2016. based on Seb's joystick for Ipad. It handles the moves on digital devices mainly phones or tablets
 */
var gameCanvas,
    graph, // c is the canvas' context 2D
    container,
    halfWidth,
    halfHeight,
    leftPointerID = -1,
    leftPointerPos = new Vector2(0, 0),
    leftPointerStartPos = new Vector2(0, 0),
    leftVector = new Vector2(0, 0);

var pointers, _baseX = 0, _stickX = 0, _baseY = 0, _stickY = 0, _pressed = false, _stationaryBase = false;

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
    halfHeight = gameCanvas.height / 2;

    //make sure we scroll to the top left.
    window.scrollTo(0, 0);
}

function drawTouch() {
    graph.clearRect(0, 0, screenWidth, screenHeight);
    graph.fillStyle = "#000000";
    graph.fillRect(0, 0, screenWidth, screenHeight);

    pointers.forEach(function (pointer) {
        graph.globalAlpha = 0.7;

        if (pointer.identifier == leftPointerID) {
            graph.beginPath();
            graph.strokeStyle = "white";
            graph.lineWidth = 6;
            graph.arc(leftPointerStartPos.x, leftPointerStartPos.y, 40, 0, Math.PI * 2, true);
            graph.stroke();
            graph.beginPath();
            graph.strokeStyle = "white";
            graph.lineWidth = 2;
            graph.arc(leftPointerStartPos.x, leftPointerStartPos.y, 60, 0, Math.PI * 2, true);
            graph.stroke();
            graph.beginPath();
            graph.strokeStyle = "white";
            graph.arc(leftPointerPos.x, leftPointerPos.y, 40, 0, Math.PI * 2, true);
            graph.stroke();

        }
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

    directionLock = true;
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

        directionLock = true;
    }
}

function onPointerUp(e) {
    _pressed = false;

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