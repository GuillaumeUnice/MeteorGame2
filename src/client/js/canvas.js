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
    reenviar = true;
    directionUp(event);
}

function gameInput(mouse) {
    if (!directionLock) {

        target.x = mouse.clientX - screenWidth / 2;
        target.y = mouse.clientY - screenHeight / 2;
        //TODO : ne pas supprimer
        //console.log(target);
    }
}

function keyInput(event) {
    var key = event.which || event.keyCode;
    if (key === KEY_FIREFOOD && reenviar) {
        socket.emit('1');
        reenviar = false;
    }
}

