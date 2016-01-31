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
        graph.fillStyle = '#333333';
        graph.fillRect(0, 0, screenWidth, screenHeight);

        graph.textAlign = 'center';
        graph.fillStyle = '#FFFFFF';
        graph.font = 'bold 30px sans-serif';
        graph.fillText('You died!', screenWidth / 2, screenHeight / 2);
    }

    else if (!disconnected) {
        var orderMass = [];

        /**
         * When the game has started
         */
        if (gameStart) {

            graph.fillStyle = '#000000';
            graph.fillRect(0, 0, screenWidth, screenHeight);

            drawgrid();
            if (object !== 'undefined') {
                for (var x = 0; x < object.length; x++) {
                    drawObject(object[x]);
                }
            }
            //  object.forEach(drawObject);

            fireFood.forEach(drawBullet);

            if (borderDraw) {
                drawborder();
            }
            for (var i = 0; i < users.length; i++) {
                for (var j = 0; j < users[i].cells.length; j++) {
                    orderMass.push({
                        nCell: i,
                        nDiv: j,
                        mass: users[i].cells[j].mass
                    });
                }
            }
            orderMass.sort(function (obj1, obj2) {
                return obj1.mass - obj2.mass;
            });


            drawPlayers(orderMass);

            socket.emit('0', target); // playerSendTarget "Heartbeat".

        } else {
            graph.fillStyle = '#333333';
            graph.fillRect(0, 0, screenWidth, screenHeight);

            graph.textAlign = 'center';
            graph.fillStyle = '#FFFFFF';
            graph.font = 'bold 30px sans-serif';
            graph.fillText('Game Over!', screenWidth / 2, screenHeight / 2);
        }
    } else {

        graph.fillStyle = '#333333';
        graph.fillRect(0, 0, screenWidth, screenHeight);

        graph.textAlign = 'center';
        graph.fillStyle = '#FFFFFF';
        graph.font = 'bold 30px sans-serif';
        if (kicked) {
            if (reason !== '') {
                graph.fillText('You were kicked for:', screenWidth / 2, screenHeight / 2 - 20);
                graph.fillText(reason, screenWidth / 2, screenHeight / 2 + 20);
            }
            else {
                graph.fillText('You were kicked!', screenWidth / 2, screenHeight / 2);
            }

        }
        else {
            graph.fillText('Disconnected!', screenWidth / 2, screenHeight / 2);
        }
    }
}

window.addEventListener('resize', resize);