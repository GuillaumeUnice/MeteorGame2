/// / socket stuff.
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
        console.log(playerSettings);
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
        console.log('Game started at: ' + gameStart);


        if (mobile) {
            document.getElementById('gameAreaWrapper').removeChild(document.getElementById('chatbox'));
        }
        c.focus();
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

        for (var i = 0; i < leaderboard.length; i++) {
            status += '<br />';
            if (leaderboard[i].id == player.id) {
                if (leaderboard[i].name.length !== 0) {
                    status += '<span class="me">' + (i + 1) + '. ' + leaderboard[i].name + "</span>";
                    miniMapFrame.fillStyle = "#00FF00";

                } else
                    status += '<span class="me">' + (i + 1) + ". An unnamed cell</span>";
            } else {
                if (leaderboard[i].name.length !== 0) {
                    status += (i + 1) + '. ' + leaderboard[i].name;
                    miniMapFrame.fillStyle = "#FF0000";

                } else
                    status += (i + 1) + '. An unnamed cell';
            }

            miniMapFrame.fillRect(miniMap.width * leaderboard[i].x / gameWidth, miniMap.height * leaderboard[i].y / gameHeight, 4, 4);
        }
        //status += '<br />Players: ' + data.players;
        document.getElementById('status').innerHTML = status;
    });

    // Handle movement.
    socket.on('serverTellPlayerMove', function (userData, foodsList, massList, virusList) {
        var playerData;
        for (var i = 0; i < userData.length; i++) {
            if (typeof(userData[i].id) == "undefined") {
                playerData = userData[i];
                i = userData.length;
            }
        }
        if (playerType == 'player') {
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
        users = userData;
        foods = foodsList;
        viruses = virusList;
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


    socket.on('fire', function (player) {
        document.getElementById('munitionsBar').style.width = (player.munitions * 500 / 10) + 'px';
        document.getElementById('munitionPoint').innerHTML = player.munitions;
    });

    socket.on('proposeJoin', function () {

        $('#regroup').css("display", "none");
        $("#joinDiv").css("visibility", "visible")

    });
}


function resize() {
    player.screenWidth = c.width = screenWidth = playerType == 'player' ? window.innerWidth : gameWidth;
    player.screenHeight = c.height = screenHeight = playerType == 'player' ? window.innerHeight : gameHeight;
    socket.emit('windowResized', {screenWidth: screenWidth, screenHeight: screenHeight});
}

