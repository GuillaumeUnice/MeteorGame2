/**
 * All the matters related to the socket's responses
 * @param socket
 */
var soundRepository = new function () {

    this.bulletSound = new Audio('../sounds/bullet.mp3');
    this.dropBulletSound = new Audio('../sounds/dropBullet.mp3');
    this.lifeSound = new Audio('../sounds/life.mp3');
    this.loseLifeSound = new Audio('../sounds/looseLife.mp3');

};

function setupSocket(socket) {

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
        console.log('Player');
        console.log(player);
        document.getElementById('munitionPoint').innerHTML = player.munitions;
        document.getElementById('lifePoint').innerHTML = player.life;
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
        leaderboard = data.leaderboard;
        var status = '<span class="title">Connected</span>';
        miniMapFrame.clearRect(0, 0, gameWidth, gameHeight);
        var pictoWidth = 16, pictoHeight = 16;

        if (screenWidth >= 320 && screenWidth <= 767) {
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
            //The point in miniMap that present the other players
            else {
                if (leaderboard[i].name.length !== 0) {
                    status += (i + 1) + '. ' + leaderboard[i].name;
                    miniMapFrame.fillStyle = "#FF0000";

                } else
                    status += (i + 1) + '. An unnamed cell';
            }
            //The point in miniMap that present the super vaisseau
            if (!leaderboard[i].isInSuperVessel || leaderboard[i].isDisplayer) {
                if (leaderboard[i].isDisplayer)
                    miniMapFrame.fillStyle = "#FFFFFF";

                miniMapFrame.fillRect(0.98 * miniMap.width * leaderboard[i].x / gameWidth, 0.97 * miniMap.height * leaderboard[i].y / gameHeight, pictoWidth, pictoHeight);
            }
        }
        //status += '<br />Players: ' + data.players;
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
    socket.on('fire', function (players) {

        var munitionBar = document.getElementById('munitionsBar');
        console.log(munitionBar.style.height);
        if (screenWidth >= 320 && screenWidth <= 767) {
            munitionBar.style.height = (players.munitions * 150 / 100) + 'px';
            munitionBar.style.width = 5 + 'px';
        }
        if (screenWidth >= 768) {
            munitionBar.style.width = (players.munitions * 10) + 'px';
            munitionBar.style.height = 5 + 'px';
        }
        var audio = new Audio('../sounds/bullet.mp3');
        audio.play();
        document.getElementById('munitionPoint').innerHTML = players.munitions;
    });

    //Bullet bar, add bullet
    socket.on('dropBullet', function (players) {
        //The munitionBar
        var munitionBar = document.getElementById('munitionsBar');
        console.log(munitionBar.style.height);
        if (screenWidth >= 320 && screenWidth <= 767) {
            munitionBar.style.height = (players.munitions * 150 / 100) + 'px';
            munitionBar.style.width = 5 + 'px';
        }
        if (screenWidth >= 768) {
            munitionBar.style.width = (players.munitions * 10) + 'px';
            munitionBar.style.height = 5 + 'px';
        }

        var audio = new Audio('../sounds/dropBullet.mp3');
        audio.play();
        document.getElementById('munitionPoint').innerHTML = players.munitions;
    });

    //A DEPLACER
    //Gestion of the lift barre
    socket.on('wound', function (currentPlayer) {
        var audio;
        if (currentPlayer.life > player.life) {
            console.log("Animation gain de vie");
            audio = new Audio('../sounds/life.mp3');
            audio.play();
        }
        else if (currentPlayer.life < player.life) {
            audio = new Audio('../sounds/looseLife.mp3');
            audio.play();
            document.getElementById('blood').className = "fadeIn";
            document.getElementById('blood').style.display = "block";
            setTimeout(function () {
                document.getElementById('blood').style.display = "none";
                document.getElementById('blood').className = "";
            }, 500);

        }

        player.life = currentPlayer.life;

        console.log(player.life);
        var lifeBar = document.getElementById('lifeBar');
        if (screenWidth >= 320 && screenWidth <= 767) {
            lifeBar.style.height = (player.life * 150 / 100) + 'px';
            lifeBar.style.width = 5 + 'px';
        }
        if (screenWidth >= 768) {
            lifeBar.style.width = (player.life * 10) + 'px';
            lifeBar.style.height = 5 + 'px';
        }
        document.getElementById('lifePoint').innerHTML = player.life;
    });

    window.onresize = function (currentPlayer) {

        // partie munition

        var munitionBar = document.getElementById('munitionsBar');
        if (screenWidth >= 320 && screenWidth <= 767) {
            munitionBar.style.height = (player.munitions * 150 / 100) + 'px';
            munitionBar.style.width = 5 + 'px'
        }
        if (screenWidth >= 768) {
            munitionBar.style.width = (player.munitions * 500 / 100) + 'px';
            munitionBar.style.height = 5 + 'px';
        }
        //document.getElementById('munitionPoint').innerHTML = player.munitions;


        //partie points de vie

        //document.getElementById('lifePoint').innerHTML = player.life;

        var lifeBar = document.getElementById('lifeBar');
        if (screenWidth >= 320 && screenWidth <= 767) {
            lifeBar.style.height = (player.life * 150 / 100) + 'px';
            lifeBar.style.width = '5';
        }
        if (screenWidth >= 768) {
            lifeBar.style.width = (player.life * 500 / 100) + 'px';
            lifeBar.style.height = '5';
        }

    };
    socket.on('proposeJoin', function (currentPlayer) {
        if (!connectedToOthers) {
            $('#regroup').css("visibility", "hidden");
            $('#joinDiv').css("visibility", "visible");
            $('#joinText').html('Do you want to join <span class="label label-primary">' + currentPlayer.name + '\'s</span> team');
        }
    });

    socket.on('teamFull', function (superVessel) {
        var isIn = false;
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

