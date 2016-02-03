/**
 * In this file, there are all the functions made for drawing the different elements displayed in  the arena
 * Created by Ying on 29/01/2016.
 */
var imageRepository = new function () {
    this.playerImg = new Image();
    this.otherPlayerImg = new Image();
    this.bulletImg = new Image();
    this.starImg = new Image();
    this.bombImg = new Image();
    this.minimapImg = new Image();
    this.objectImg = new Image();

    this.player_up = "../img/ship_up.png";
    this.player_down = "../img/ship_down.png";
    this.player_left = "../img/ship_left.png";
    this.player_right = "../img/ship_right.png";

    this.playerImg.src = this.player_up;
    this.otherPlayerImg.src = this.player_up;
    this.bulletImg.src = "../img/bullet.png";
    this.starImg.src = "../img/star.png";
    this.bombImg.src = "../img/bomb.png";
    this.minimapImg.src = "../img/ship_up.svg";
};

function drawObject(object) {
    var objectSize = 80;

    if (onTablet()) {
        objectSize = 30;
    }

    imageRepository.objectImg.src = object.imageUrl;

    graph.globalAlpha = 1;

    graph.drawImage(imageRepository.objectImg, object.x - player.x + screenWidth / 2 + 100, object.y - player.y + screenHeight / 2 + 100, objectSize, objectSize);

}

function drawBullet(mass) {

    var offset = 0, bulletWidth = 30, bulletHeight = 30;

    graph.globalAlpha = 1;

    if (onTablet()) {
        offset = -70;
    }

    if (onTablet() || onSmartphone()) {
        bulletHeight = bulletWidth = 15;
    }

    graph.drawImage(imageRepository.bulletImg, mass.x - player.x + 105 + screenWidth / 2 + offset, mass.y - player.y + 100 + screenHeight / 2 + offset, bulletWidth, bulletHeight);

}

function drawPlayers(order) {
    var start = {
        x: player.x - (screenWidth / 2),
        y: player.y - (screenHeight / 2)
    }, playerImgWidth = 200, playerImgHeight = 200;

    graph.globalAlpha = 1;

    if (onTablet()) {
        playerImgWidth = playerImgHeight = 75;
    }

    for (var z = 0; z < order.length; z++) {
        var userCurrent = users[order[z].nCell];
        var cellCurrent = users[order[z].nCell].cells[order[z].nDiv];
        var circle = {
            x: cellCurrent.x - start.x,
            y: cellCurrent.y - start.y
        };

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
        }

    }
}


/**
 * Draws the grid representing the game are
 */
function drawGrid() {
    graph.fillStyle = '#000000';
    graph.fillRect(0, 0, screenWidth, screenHeight);
    graph.strokeStyle = '#FFFFFF';
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
        graph.drawImage(imageRepository.starImg, Math.random() * screenWidth, Math.random() * screenHeight, Math.random() * 20, Math.random() * 20);
        graph.globalAlpha = 0.1;
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
