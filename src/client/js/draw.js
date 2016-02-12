/**
 * In this file, there are all the functions made for drawing the different elements displayed in  the arena
 * Created by Ying on 29/01/2016.
 */

function drawCircle(centerX, centerY, radius, sides) {
    var theta = 0;
    var x = 0;
    var y = 0;

    graph.beginPath();

    for (var i = 0; i < sides; i++) {
        theta = (i / sides) * 2 * Math.PI;
        x = centerX + radius * Math.sin(theta);
        y = centerY + radius * Math.cos(theta);
        graph.lineTo(x, y);
    }

    graph.closePath();
    graph.stroke();
    graph.fill();
}

/**
 * Draws all the objects appearing on the arena; namely bombs, bullets and life points
 * @param object
 */
function drawObject(object) {

console.log(object);

    graph.strokeStyle = object.stroke;
    if(object.type == "life") {
        graph.fillStyle = "#33ff33";
    } else if(object.type == "mine") {
        graph.fillStyle = "#FF3030";
    } else {
        graph.fillStyle = "#060202";
    }
        
    graph.lineWidth = object.strokeWidth;

    drawCircle(object.x - player.x + screenWidth / 2 + 100, object.y - player.y + screenHeight / 2 + 100, 20, 30);
  
   /* var objectSize = 60;

    if (onTablet() || onSmartphone()) {
        objectSize = 30;
    }

    imageRepository.objectImg.src = object.imageUrl;

    graph.globalAlpha = 1;

    graph.drawImage(imageRepository.objectImg, object.x - player.x + screenWidth / 2,
        object.y - player.y + screenHeight / 2, objectSize, objectSize);*/

}
//draw the start position of bullet
function drawBullet(bullet) {

    var offset = 0, bulletWidth = 30, bulletHeight = 30;
    if (onTablet()) {
        offset = -70;
    }
    if (onTablet() || onSmartphone()) {
        bulletHeight = bulletWidth = 15;
    }

    graph.globalAlpha = 1;
    graph.drawImage(imageRepository.bulletImg, bullet.x - player.x + 105 + screenWidth / 2 + offset, bullet.y - player.y + 100 + screenHeight / 2 + offset, bulletWidth, bulletHeight);
    vibrate();
}

function drawPlayers(order) {
    var start = {
        x: player.x - (screenWidth / 2),
        y: player.y - (screenHeight / 2)
    }, playerImgWidth = 200, playerImgHeight = 200;


    if (onTablet()) {
        playerImgWidth = playerImgHeight = 75;
    }

    graph.globalAlpha = 1;

    for (var z = 0; z < order.length; z++) {
        var userCurrent = users[order[z].nCell];
        var cellCurrent = users[order[z].nCell].cells[order[z].nDiv];
        var circle = {
            x: cellCurrent.x - start.x,
            y: cellCurrent.y - start.y
        };
        imageRepository.circle = circle;
        var nameCell = "";
        if (typeof userCurrent.id == "undefined") {
            nameCell = player.name;

        } else {
            nameCell = userCurrent.name;
        }

        var fontSize = Math.max(cellCurrent.radius / 3, 12);

        graph.font = 'bold ' + fontSize + 'px sans-serif';
        graph.fillStyle = '#FF0000';
        if (!userCurrent.isRegrouped.value) {
            if (typeof userCurrent.id == "undefined") {
                graph.drawImage(imageRepository.playerImg, circle.x, circle.y, playerImgWidth, playerImgHeight);
            }
            else {
                graph.drawImage(imageRepository.otherPlayerImg, circle.x, circle.y, playerImgWidth, playerImgHeight);
            }
            graph.fillText(nameCell, circle.x + playerImgWidth / 2, circle.y);

        } else {
            var messageInfo = $('#message-info');
            $('#panel-message').css('display', 'block');
            messageInfo.text('You are now linked to a super spaceship');
            //Draw it only on the displayer screen
            if ((userCurrent.isRegrouped.lead === player.id && !(typeof userCurrent.id == "undefined")) || userCurrent.isRegrouped.isLead) {

                if (player.isRegrouped.isLead) {
                    /***
                     * In case the projector works
                     */
                    // if (window.matchMedia("projector").matches || window.matchMedia("tv").matches) {
                    if (onProjector()) {
                        messageInfo.text('You are using a projector or a tv');

                        if (typeof userCurrent.id == "undefined") {
                            graph.drawImage(imageRepository.playerImg, circle.x, circle.y, playerImgWidth, playerImgHeight);
                            graph.drawImage(imageRepository.playerImg, circle.x - 100, circle.y + 100, playerImgWidth, playerImgHeight);
                            graph.drawImage(imageRepository.playerImg, circle.x + 100, circle.y + 100, playerImgWidth, playerImgHeight);
                            graph.drawImage(imageRepository.playerImg, circle.x, circle.y + 200, playerImgWidth, playerImgHeight);
                        }

                        graph.fillText(nameCell, circle.x + playerImgWidth / 2, circle.y);
                    } else {
                        messageInfo.text('Please, use a projector');

                    }

                }

            }


        }
    }
}


/**
 * Draws the grid representing the game are
 */
function drawGrid() {
    graph.fillStyle = '#333333';
    graph.globalAlpha = 0.7;

    graph.fillRect(0, 0, screenWidth, screenHeight);
    graph.strokeStyle = '#FFFFFF';
    graph.lineWidth = 2;
    graph.globalAlpha = 0.08;

    graph.beginPath();

    for (var x = xoffset - player.x; x < screenWidth; x += screenHeight / 18) {
        graph.moveTo(x, 0);
        graph.lineTo(x, screenHeight);

    }
    for (var y = yoffset - player.y; y < screenHeight; y += screenHeight / 18) {
        graph.moveTo(0, y);
        graph.lineTo(screenWidth, y);
    }


    graph.stroke();
    graph.globalAlpha = 1;

    for (var i = 0; i <= 3; i++) {
        graph.beginPath();
        graph.arc(Math.random() * screenWidth, Math.random() * screenHeight, Math.random() * 5, 0, 2 * Math.PI, false);
        graph.fillStyle = '#FFFA76';

        graph.fill();
        //  graph.drawImage(imageRepository.starImg, Math.random() * screenWidth, Math.random() * screenHeight, Math.random() * 20, Math.random() * 20);
        graph.globalAlpha = 0.7;
    }
}

/**
 * draws the border of the game area
 */
function drawBorder() {
    graph.lineWidth = 1;
    graph.strokeStyle = borderColor;

    // Left-vertical.
    if (player.x <= screenWidth / 2) {
        graph.beginPath();
        graph.moveTo(screenWidth / 2 - player.x, 0 ? player.y > screenHeight / 2 : screenHeight / 2 - player.y);
        graph.lineTo(screenWidth / 2 - player.x, gameHeight + screenHeight / 2 - player.y);
        graph.stroke();
    }

    // Top-horizontal.
    if (player.y <= screenHeight / 2) {
        graph.beginPath();
        graph.moveTo(0 ? player.x > screenWidth / 2 : screenWidth / 2 - player.x, screenHeight / 2 - player.y);
        graph.lineTo(gameWidth + screenWidth / 2 - player.x, screenHeight / 2 - player.y);
        graph.stroke();
    }

    // Right-vertical.
    if (gameWidth - player.x <= screenWidth / 2) {
        graph.beginPath();
        graph.moveTo(gameWidth + screenWidth / 2 - player.x, screenHeight / 2 - player.y);
        graph.lineTo(gameWidth + screenWidth / 2 - player.x, gameHeight + screenHeight / 2 - player.y);
        graph.stroke();
    }

    // Bottom-horizontal.
    if (gameHeight - player.y <= screenHeight / 2) {
        graph.beginPath();
        graph.moveTo(gameWidth + screenWidth / 2 - player.x, gameHeight + screenHeight / 2 - player.y);
        graph.lineTo(screenWidth / 2 - player.x, gameHeight + screenHeight / 2 - player.y);
        graph.stroke();
    }
}


/**
 * Called to draw explosion image when a space ship is touched
 * @param currentPlayer
 */
function drawExplosion(currentPlayer) {
    var explosion;
    var explosionImage;

    function gameLoop() {
        window.requestAnimationFrame(gameLoop);
        explosion.update();
        explosion.render();
    }

    explosionImage = new Image();
    explosionImage.src = "../img/explode.png";
    graph.globalAlpha = 1;
    explosion = sprite({
        context: graph,
        width: 2048,
        height: 128,
        image: explosionImage,
        numberOfFrames: 16,
        ticksPerFrame: 1,
        x: currentPlayer.x,
        y: currentPlayer.y
    });

    explosionImage.addEventListener("load", gameLoop);

}

function sprite(options) {

    var that = {};
    var frameIndex = 0;
    var tickCount = 0;
    var ticksPerFrame = options.ticksPerFrame || 0;
    var numberOfFrames = options.numberOfFrames || 1;
    var xPosition = options.x;
    var yPosition = options.y;

    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.image = options.image;
    that.draw = true;

    that.update = function () {

        tickCount += 1;

        if (tickCount > ticksPerFrame) {

            tickCount = 0;

            if (frameIndex < numberOfFrames - 1) {
                frameIndex += 1;
            } else {
                that.draw = false;
            }
        }
    };

    that.render = function () {
        if (that.draw) {
            that.context.drawImage(
                that.image,
                frameIndex * that.width / numberOfFrames,
                0,
                that.width / numberOfFrames,
                that.height,
                imageRepository.circle.x,
                imageRepository.circle.y,
                that.width / numberOfFrames,
                that.height);
            console.log(xPosition + "-----------" + yPosition);
        }
    };

    return that;
}