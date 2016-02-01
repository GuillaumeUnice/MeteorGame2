/**
 *This file is made for setting up the canvas
 * @type {Number}
 */
// Canvas.
gameCanvas.width = screenWidth;
gameCanvas.height = screenHeight;

gameCanvas.addEventListener('keyup', onKeyUp, false);
gameCanvas.addEventListener('keypress', keyInput, false);
gameCanvas.addEventListener('keydown', directionDown, false);

function onKeyUp(event) {
    reSend = true;
    directionUp(event);
}

function keyInput(event) {
    var key = event.which || event.keyCode;
    if (key === KEY_FIREFOOD && reSend) {
        socket.emit('1');
        reSend = false;
    }
}

