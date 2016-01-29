/**
 * Created by Ying on 29/01/2016.
 */
var imageRepository = new function () {
    this.playerImg = new Image();
    this.otherPlayerImg = new Image();
    this.bulletImg = new Image();
    this.backgroundImg = new Image();
    this.starImg = new Image();
    this.bombImg = new Image();

    this.player_up = "../img/ship_up.png";
    this.player_down = "../img/ship_down.png";
    this.player_left = "../img/ship_left.png";
    this.player_right = "../img/ship_right.png";

    this.playerImg.src = this.player_up;
    this.otherPlayerImg.src = this.player_up;
    this.bulletImg.src = "../img/bullet.png";
    this.backgroundImg.src = "../img/sky.jpg";
    this.starImg.src = "../img/star.png";
    this.bombImg.src = "../img/bomb.png";
};


function drawCircle(centerX, centerY, radius, sides) {
    graph.globalAlpha = 1;

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


function drawObject(object) {

        var img = new Image();
        img.src = object.imageUrl;
        console.log(img.src);
        graph.strokeStyle = object.stroke;
        graph.fillStyle = object.fill;
        graph.lineWidth = object.strokeWidth;
        graph.globalAlpha = 1;
    //    drawCircle(object.x - player.x + screenWidth / 2 + 100, object.y - player.y + screenHeight / 2 + 100, 20, 30);
        graph.drawImage(img, object.x - player.x + screenWidth / 2 + 100, object.y - player.y + screenHeight / 2 + 100, 70, 70);

}

function drawFireFood(mass) {

    graph.globalAlpha = 1;

    var bulletWidth = 30, bulletHeight = 30;

    if ((screenWidth >= 320 && screenWidth <= 767) || (screenWidth >= 320 && screenWidth <= 1024)) {
        bulletHeight = bulletWidth = 15;
    }

    graph.drawImage(imageRepository.bulletImg, mass.x - player.x + 105 + screenWidth / 2, mass.y - player.y + 100 + screenHeight / 2, bulletWidth, bulletHeight);

}

function drawPlayers(order) {

    graph.globalAlpha = 1;

    var start = {
        x: player.x - (screenWidth / 2),
        y: player.y - (screenHeight / 2)
    };

    var playerImgWidth = 250, playerImgHeight = 250;

    if ((screenWidth >= 320 && screenWidth <= 767) || (screenWidth >= 320 && screenWidth <= 1024)) {
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

        if (typeof userCurrent.id == "undefined") {
            graph.drawImage(imageRepository.playerImg, circle.x, circle.y, playerImgWidth, playerImgHeight);
            graph.fillText(nameCell, circle.x + playerImgWidth / 2, circle.y);
        }
        else if (!userCurrent.isInSuperVessel) {
            graph.drawImage(imageRepository.otherPlayerImg, circle.x, circle.y, playerImgWidth, playerImgHeight);
            graph.fillText(nameCell, circle.x + playerImgWidth / 2, circle.y);
        }
        else {

            $('#panel-message').css('display', 'block');
            if (userCurrent.isInSuperVessel && !userCurrent.isDisplayer) {


                var messageInfo = document.getElementById('#message-info');

                $('#message-info').text('You are now linked to a super vessel');

                if ((screenWidth >= 320 && screenWidth <= 767)) {
                    $('#feed').addClass('regroup-sm');

                    var miniM = $('#minimap');
                    miniM.removeClass('navbar-collapse collapse');
                    miniM.addClass('regroup-sm');
                    $('#regroup').addClass('regroup-sm');
                }

                if (window.orientation === 90) {
                    $('#feed').addClass('regroup-md');

                    var miniM2 = $('#minimap');
                    miniM2.removeClass('navbar-collapse collapse');
                    miniM2.addClass('regroup-md');
                    $('#regroup').addClass('regroup-md');
                }
            }

            if (userCurrent.isDisplayer) {

                $('#message-info').text('You are now linked to a super vessel that will be displayed here');
                //if (screenWidth >= 1200) {
                $('#minimap').addClass('regroup-ds');
                //}
                mySuperVessel.forEach(function (vessel) {
                    graph.drawImage(imageRepository.otherPlayerImg, vessel.x * screenWidth / gameWidth, vessel.y * screenHeight / gameHeight, playerImgWidth, playerImgHeight);
                    graph.fillText(vessel.name, vessel.x * screenWidth / gameWidth + playerImgWidth / 2, vessel.y * screenHeight / gameHeight);

                });

            }
        }


    }

    // graph.globalAlpha = 0.1;

}

function valueInRange(min, max, value) {
    return Math.min(max, Math.max(min, value));
}


function drawgrid() {

    //   graph.drawImage(imageRepository.backgroundImg,0,0, screenWidth, screenHeight);

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

    for(var i=0;i<=3;i++) {
        graph.drawImage(imageRepository.starImg, Math.random() * screenWidth, Math.random() * screenHeight, Math.random() * 20, Math.random() * 20);
        graph.globalAlpha = 0.1;
    }

    ///graph.globalAlpha = 1;

}

function drawborder() {
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
