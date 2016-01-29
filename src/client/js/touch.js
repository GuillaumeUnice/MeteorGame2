/**
 * Created by Falou on 29/01/2016.
 */
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

var gameCanvas,
    graph, // c is the canvas' context 2D
    container,
    halfWidth,
    halfHeight,
    leftPointerID = -1,
    leftPointerPos = new Vector2(0, 0),
    leftPointerStartPos = new Vector2(0, 0),
    leftVector = new Vector2(0, 0);

var pointers; // collections of pointers

document.addEventListener("DOMContentLoaded", init);

window.onorientationchange = resetCanvas;
window.onresize = resetCanvas;

function init() {
    setupCanvas();
    pointers = new Collection();
    gameCanvas.addEventListener('pointerdown', onPointerDown, false);
    gameCanvas.addEventListener('pointermove', onPointerMove, false);
    gameCanvas.addEventListener('pointerup', onPointerUp, false);
    gameCanvas.addEventListener('pointerout', onPointerUp, false);
    requestAnimFrame(drawTouch);
}

function resetCanvas(e) {
    // resize the canvas - but remember - this clears the canvas too.
    //gameCanvas.width = screenWidth;
    //gameCanvas.height = screenHeight;

    halfWidth = gameCanvas.width / 2;
    halfHeight = gameCanvas.height / 2;

    //make sure we scroll to the top left.
    window.scrollTo(0, 0);
}

function drawTouch() {
    graph.clearRect(0, 0, screenWidth, screenHeight);
    /*

     with (player) {
     if (x < 0) x = gameCanvas.width;
     else if (x > gameCanvas.width) x = 0;
     if (y < 0) y = gameCanvas.height;
     else if (y > gameCanvas.height) y = 0;
     }*/

    //   ship.draw();


    pointers.forEach(function (pointer) {
        if (pointer.identifier == leftPointerID) {
            console.log('Fucking work');

            graph.beginPath();
            graph.strokeStyle = "#FF0000";
            graph.lineWidth = 6;
            graph.arc(leftPointerStartPos.x, leftPointerStartPos.y, 40, 0, Math.PI * 2, true);
            graph.stroke();
            graph.beginPath();
            graph.strokeStyle = "#FF0000";
            graph.lineWidth = 2;
            graph.arc(leftPointerStartPos.x, leftPointerStartPos.y, 60, 0, Math.PI * 2, true);
            graph.stroke();
            graph.beginPath();
            graph.strokeStyle = "#FF0000";
            graph.arc(leftPointerPos.x, leftPointerPos.y, 40, 0, Math.PI * 2, true);
            graph.stroke();

        } else {

            graph.beginPath();
            graph.fillStyle = "#00FF00";
            graph.fillText("type : " + pointer.type + " id : " + pointer.identifier + " x:" + pointer.x +
                " y:" + pointer.y, pointer.x + 30, pointer.y - 30);

            graph.beginPath();
            graph.strokeStyle = "#0000FF";
            graph.lineWidth = "6";
            graph.arc(pointer.x, pointer.y, 40, 0, Math.PI * 2, true);
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
    console.log('Pointer down');
    var newPointer = {identifier: e.pointerId, x: e.clientX, y: e.clientY, type: givePointerType(e)};
    if ((leftPointerID < 0) && (e.clientX < halfWidth)) {
        leftPointerID = e.pointerId;
        leftPointerStartPos.reset(e.clientX, e.clientY);
        leftPointerPos.copyFrom(leftPointerStartPos);
        leftVector.reset(0, 0);
    }
    pointers.add(e.pointerId, newPointer);
}

function onPointerMove(e) {
    console.log('Pointer move');

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

    if (e.clientX - screenWidth / 2 > target.x) {
        imageRepository.playerImg.src = imageRepository.player_right;
    }
    else if (e.clientX - screenWidth / 2 < target.x) {
        imageRepository.playerImg.src = imageRepository.player_left;
    }
    else if (e.clientY - screenHeight / 2 > target.y) {
        imageRepository.playerImg.src = imageRepository.player_down;
    }
    else {
        imageRepository.playerImg.src = imageRepository.player_up;
    }

    target.x = e.clientX - screenWidth / 2;
    target.y = e.clientY - screenHeight / 2;
}

function onPointerUp(e) {
    console.log('Pointer up');

    if (leftPointerID == e.pointerId) {
        leftPointerID = -1;
        leftVector.reset(0, 0);

    }
    leftVector.reset(0, 0);

    pointers.remove(e.pointerId);
}

function setupCanvas() {
    //canvas = document.getElementById('gameArea');
    //c = canvas.getContext('2d');
    resetCanvas();
    graph.strokeStyle = "#ffffff";
    graph.lineWidth = 2;
}