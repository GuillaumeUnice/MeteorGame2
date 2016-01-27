/**
 *
 * @type {Number}
 */
// Canvas.
gameCanvas.width = screenWidth;
gameCanvas.height = screenHeight;
//gameCanvas.addEventListener('mousemove', gameInput, false);
gameCanvas.addEventListener('mouseout', outOfBounds, false);
gameCanvas.addEventListener('keyup', function (event) {
    reenviar = true;
    directionUp(event);
}, false);
gameCanvas.addEventListener('keypress', keyInput, false);
gameCanvas.addEventListener('keydown', directionDown, false);
gameCanvas.addEventListener('touchstart', touchInput, false);
gameCanvas.addEventListener('touchmove', touchInput, false);

// Register when the mouse goes off the canvas.
function outOfBounds() {
    if (!continuity) {
        target = {x: 0, y: 0};
    }
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

function touchInput(touch) {
    touch.preventDefault();
    touch.stopPropagation();
   // if (!directionLock) {
     ///   target.x = touch.touches[0].clientX - screenWidth / 2;
        //target.y = touch.touches[0].clientY - screenHeight / 2;
    //}
}