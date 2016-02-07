/**
 * All the topics related to the game animation
 */
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelAnimFrame = (function () {
    return window.cancelAnimationFrame ||
        window.mozCancelAnimationFrame;
})();

function animationLoop() {
    animLoopHandle = window.requestAnimFrame(animationLoop);
    gameLoop();
}

/**
 * The game loop
 */
function gameLoop() {
    /**
     * This message is displayed when the player dies
     */
    if (died) {
        printMessage('You died!');
    }
    else if (!disconnected) {
        var playersOrder = [];
        /**
         * When the game has started
         */
        if (gameStart) {

            drawGrid();
            if (object !== 'undefined') {
                for (var x = 0; x < object.length; x++) {
                    drawObject(object[x]);
                }
            }

            bulletsToDraw.forEach(drawBullet);

            if (borderDraw) {
                drawBorder();
            }

            for (var i = 0; i < users.length; i++) {
                for (var j = 0; j < users[i].cells.length; j++) {
                    playersOrder.push({
                        nCell: i,
                        nDiv: j,
                        mass: users[i].cells[j].mass
                    });
                }
            }
            playersOrder.sort(function (player1, player2) {
                return player1.mass - player2.mass;
            });
            drawPlayers(playersOrder);
            socket.emit('0', target); // playerSendTarget "Heartbeat".
        }
    } else {
        printMessage('Disconnected!');
    }
}

window.addEventListener('resize', resize);