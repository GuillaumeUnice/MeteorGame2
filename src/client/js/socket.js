/**
 * All the matters related to the socket's responses
 * @param socket
 */

/**
 * instantiates once for all the different sounds that will be used throughout the game.
 *  @author Falou
 * @type {soundRepository}
 */
var soundRepository = new function () {
    this.bulletSound = new Audio('../sounds/bullet.mp3');
    this.dropBulletSound = new Audio('../sounds/dropBullet.mp3');
    this.lifeSound = new Audio('../sounds/life.mp3');
    this.loseLifeSound = new Audio('../sounds/looseLife.mp3');
};

/**
 * Handles the different exchange cases between client and server
 * @param socket
 */
function setupSocket(socket) {

    window.onresize = function (currentPlayer) {
        updatePoints();
    };

    // Handle error.
    socket.on('connect_failed', function () {
        socket.close();
        disconnected = true;
    });

    socket.on('disconnect', function () {
        socket.close();
        disconnected = true;
    });

    // Handle connection.
    socket.on('welcome', function (playerSettings) {
        player = playerSettings;

        player.name = playerName;
        player.screenWidth = screenWidth;
        player.screenHeight = screenHeight;
        player.target = target;

        updatePoints();

        socket.emit('gotit', player);

        gameStart = true;
        gameCanvas.focus();
    });

    socket.on('gameSetup', function (data) {
        gameWidth = data.gameWidth;
        gameHeight = data.gameHeight;

        resize();
    });

    socket.on('leaderboard', function (data) {
        var status = '<span class="title">Connected</span>';
        var pictoWidth = 16, pictoHeight = 16;

        leaderboard = data.leaderboard;
        miniMapFrame.clearRect(0, 0, gameWidth, gameHeight);

        if (onSmartphone()) {
            pictoWidth = pictoHeight = 30;
        }
        for (var i = 0; i < leaderboard.length; i++) {
            status += '<br />';
            //The point in miniMap that present me
            if (leaderboard[i].id == player.id) {
                if (leaderboard[i].name.length !== 0) {
                    status += '<span class="me">' + (i + 1) + '. ' + leaderboard[i].name + "</span>";
                    miniMapFrame.fillStyle = "#00FF00";
                } else {
                    status += '<span class="me">' + (i + 1) + ". An unnamed cell</span>";
                }
            }
            //The point in miniMap that represents the other players
            else {
                if (leaderboard[i].name.length !== 0) {
                    status += (i + 1) + '. ' + leaderboard[i].name;
                    miniMapFrame.fillStyle = "#FF0000";

                } else
                    status += (i + 1) + '. An unnamed cell';
            }
            //The point in miniMap that present the super spaceship
            if (!leaderboard[i].isInSuperVessel || leaderboard[i].isDisplayer) {
                if (leaderboard[i].isDisplayer)
                    miniMapFrame.fillStyle = "#FFFFFF";
                miniMapFrame.fillRect(0.98 * miniMap.width * leaderboard[i].x / gameWidth, 0.97 * miniMap.height * leaderboard[i].y / gameHeight, pictoWidth, pictoHeight);
            }
        }
        document.getElementById('status').innerHTML = status;
    });

    // Handle movement.
    socket.on('serverTellPlayerMove', function (userData, foodsList, massList, virusList, objectList) {
        var playerData;
        for (var i = 0; i < userData.length; i++) {
            if (typeof(userData[i].id) == "undefined") {
                playerData = userData[i];

                i = userData.length;
            }
        }
        if (playerType == 'player') {
            if (playerData) {
                var xoffset = player.x - playerData.x;
                var yoffset = player.y - playerData.y;
                player.x = playerData.x;
                player.y = playerData.y;
                player.hue = playerData.hue;
                player.massTotal = playerData.massTotal;
                player.cells = playerData.cells;
                player.xoffset = isNaN(xoffset) ? 0 : xoffset;
                player.yoffset = isNaN(yoffset) ? 0 : yoffset;
            }
        }
        users = userData;
        foods = foodsList;
        viruses = virusList;
        object = objectList;
        fireFood = massList;
    });

    // Death.
    socket.on('RIP', function () {
        gameStart = false;
        died = true;
        window.setTimeout(function () {
            document.getElementById('gameAreaWrapper').style.opacity = 0;
            document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
            died = false;
            if (animLoopHandle) {
                window.cancelAnimationFrame(animLoopHandle);
                animLoopHandle = undefined;
            }
        }, 2500);
    });

    //Bullet bar, lost bullet
    socket.on('fire', function (player) {
        soundRepository.bulletSound.play();
        updateMunition();
    });

    //Bullet bar, add bullet
    socket.on('dropBullet', function (players) {
        //The munitionBar
        soundRepository.dropBulletSound.play();
        updateMunition();
    });

    //A DEPLACER
    //Gestion of the lift barre
    socket.on('wound', function (currentPlayer) {
        if (currentPlayer.life > player.life) {
            console.log("Animation gain de vie");
            soundRepository.lifeSound.play();
        }
        else if (currentPlayer.life < player.life) {
            soundRepository.loseLifeSound.play();
            document.getElementById('blood').className = "fadeIn";
            document.getElementById('blood').style.display = "block";
            setTimeout(function () {
                document.getElementById('blood').style.display = "none";
                document.getElementById('blood').className = "";
            }, 500);

        }

        player.life = currentPlayer.life;
        updateLife();
    });

    socket.on('proposeJoin', function (currentPlayer) {
        if (!connectedToOthers) {
            $('#regroup').css("visibility", "hidden");
            $('#joinDiv').css("visibility", "visible");
            $('#joinText').html('Do you want to join <span class="label label-primary">' + currentPlayer.name + '\'s</span> team');
        }
    });

    socket.on('teamFull', function (superVessel) {
        mySuperVessel = superVessel;

        mySuperVessel.forEach(function (vessel) {
            if (vessel.isDisplayer) {
                Leap.loop(setLeap).use('screenPosition', {scale: 0.25});
                Leap.loopController.setBackground(true);
            }
        });

        if (askingPlayer) {
            $('#regroup').removeClass('fa-spinner');
        }

    });

    socket.on('gameOver', function () {
        gameStart = false;

        window.setTimeout(function () {
            document.getElementById('gameAreaWrapper').style.opacity = 0;
            document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
            died = false;
            if (animLoopHandle) {
                window.cancelAnimationFrame(animLoopHandle);
                animLoopHandle = undefined;
            }
        }, 2500);
    });
}

function resize() {
    player.screenWidth = gameCanvas.width = screenWidth = playerType == 'player' ? window.innerWidth : gameWidth;
    player.screenHeight = gameCanvas.height = screenHeight = playerType == 'player' ? window.innerHeight : gameHeight;
    if (socket)
        socket.emit('windowResized', {screenWidth: screenWidth, screenHeight: screenHeight});
}