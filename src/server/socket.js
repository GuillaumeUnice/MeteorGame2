var util = require('./lib/util');


/***********************************************************************START SOCKET*************************************************************************/
/************************************************************************************************************************************************/
/*
 *All the socket functions.
 * - game global : start , disconnect ect
 * - windows configuration
 * - chat
 * - login autentification
 * - kick a normal player as admin player
 * - play : feed and split
 * - keyboard action
 * - check latency
 **/


exports.ioon = function (socket, c, users, sockets) {
    console.log('A user connected!', socket.handshake.query.type);
//initialize a player
    var type = socket.handshake.query.type;
    var radius = util.massToRadius(c.defaultPlayerMass);
    var position = c.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);

    var cells = [];
    var massTotal = 0;
    if (type === 'player') {
        cells = [{
            mass: c.defaultPlayerMass,
            x: position.x,
            y: position.y,
            radius: radius
        }];
        massTotal = c.defaultPlayerMass;
    }

    var currentPlayer = {
        id: socket.id,
        x: position.x,
        y: position.y,
        cells: cells,
        massTotal: massTotal,
        hue: Math.round(Math.random() * 360),
        type: type,
        lastHeartbeat: new Date().getTime(),
        target: {
            x: 0,
            y: 0
        }
    };


    /*..........................................game global.................................................*/
//if client start game
    socket.on('respawn', function () {
        if (util.findIndex(users, currentPlayer.id) > -1)
            users.splice(util.findIndex(users, currentPlayer.id), 1);
        socket.emit('welcome', currentPlayer);
        console.log('[INFO] User ' + currentPlayer.name + ' respawned!');
    });

//if client listen on 'welcome' and send 'gotit' with object player
    socket.on('gotit', function (player) {
        console.log('[INFO] Player ' + player.name + ' connecting!');

        if (util.findIndex(users, player.id) > -1) {
            console.log('[INFO] Player ID is already connected, kicking.');
            socket.disconnect();
        } else if (!util.validNick(player.name)) {
            socket.emit('kick', 'Invalid username.');
            socket.disconnect();
        } else {
            console.log('[INFO] Player ' + player.name + ' connected!');
            sockets[player.id] = socket;

            var radius = util.massToRadius(c.defaultPlayerMass);
            var position = c.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);

            player.x = position.x;
            player.y = position.y;
            player.target.x = 0;
            player.target.y = 0;
            if (type === 'player') {
                player.cells = [{
                    mass: c.defaultPlayerMass,
                    x: position.x,
                    y: position.y,
                    radius: radius
                }];
                player.massTotal = c.defaultPlayerMass;
            }
            else {
                player.cells = [];
                player.massTotal = 0;
            }
            player.hue = Math.round(Math.random() * 360);
            currentPlayer = player;
            currentPlayer.lastHeartbeat = new Date().getTime();
            //add a player
            users.push(currentPlayer);

            io.emit('playerJoin', {name: currentPlayer.name});

            socket.emit('gameSetup', {
                gameWidth: c.gameWidth,
                gameHeight: c.gameHeight
            });
            console.log('Total players: ' + users.length);
        }

    });

//if client disconnect
    socket.on('disconnect', function () {
        if (util.findIndex(users, currentPlayer.id) > -1)
            users.splice(util.findIndex(users, currentPlayer.id), 1);
        console.log('[INFO] User ' + currentPlayer.name + ' disconnected!');

        socket.broadcast.emit('playerDisconnect', {name: currentPlayer.name});
    });


    /*.........................windows configuration..............................*/
    socket.on('windowResized', function (data) {
        currentPlayer.screenWidth = data.screenWidth;
        currentPlayer.screenHeight = data.screenHeight;
    });

    /*.................................chart......................................*/
    /* socket.on('playerChat', function(data) {
     var _sender = data.sender.replace(/(<([^>]+)>)/ig, '');
     var _message = data.message.replace(/(<([^>]+)>)/ig, '');
     if (c.logChat === 1) {
     console.log('[CHAT] [' + (new Date()).getHours() + ':' + (new Date()).getMinutes() + '] ' + _sender + ': ' + _message);
     }
     socket.broadcast.emit('serverSendPlayerChat', {sender: _sender, message: _message.substring(0,35)});
     });
     */
    /*................................. login ......................................*/
    /*    socket.on('pass', function(data) {
     if (data[0] === c.adminPass) {
     console.log('[ADMIN] ' + currentPlayer.name + ' just logged in as an admin!');
     socket.emit('serverMSG', 'Welcome back ' + currentPlayer.name);
     socket.broadcast.emit('serverMSG', currentPlayer.name + ' just logged in as admin!');
     currentPlayer.admin = true;
     } else {
     console.log('[ADMIN] ' + currentPlayer.name + ' attempted to log in with incorrect password.');
     socket.emit('serverMSG', 'Password incorrect, attempt logged.');
     // TODO: Actually log incorrect passwords.
     }
     });*/
    /*................................. yeah! let's play together!.................................*/

//feed, client call this in client/app.js
    socket.on('1', function () {
        // Fire food.
        for (var i = 0; i < currentPlayer.cells.length; i++) {
            if (((currentPlayer.cells[i].mass >= c.defaultPlayerMass + c.fireFood) && c.fireFood > 0) || (currentPlayer.cells[i].mass >= 20 && c.fireFood === 0)) {
                var masa = 1;
                if (c.fireFood > 0)
                    masa = c.fireFood;
                else
                    masa = currentPlayer.cells[i].mass * 0.1;
                currentPlayer.cells[i].mass -= masa;
                currentPlayer.massTotal -= masa;
                massFood.push({
                    id: currentPlayer.id,
                    num: i,
                    masa: masa,
                    hue: currentPlayer.hue,
                    target: {
                        x: currentPlayer.x - currentPlayer.cells[i].x + currentPlayer.target.x,
                        y: currentPlayer.y - currentPlayer.cells[i].y + currentPlayer.target.y
                    },
                    x: currentPlayer.cells[i].x,
                    y: currentPlayer.cells[i].y,
                    radius: util.massToRadius(masa),
                    speed: 25
                });
            }
        }
    });

//split, client call this in client/app.js
    socket.on('2', function () {
        //Split cells.
        if (currentPlayer.cells.length < c.limitSplit && currentPlayer.massTotal >= c.defaultPlayerMass * 2) {
            var numMax = currentPlayer.cells.length;
            for (var d = 0; d < numMax; d++) {
                if (currentPlayer.cells[d].mass >= c.defaultPlayerMass * 2) {
                    currentPlayer.cells[d].mass = currentPlayer.cells[d].mass / 2;
                    currentPlayer.cells[d].radius = util.massToRadius(currentPlayer.cells[d].mass);
                    currentPlayer.cells.push({
                        mass: currentPlayer.cells[d].mass,
                        x: currentPlayer.cells[d].x,
                        y: currentPlayer.cells[d].y,
                        radius: currentPlayer.cells[d].radius,
                        speed: 25
                    });
                }
            }
            currentPlayer.lastSplit = new Date().getTime();
        }
    });

// keyboard action, to change direction, see also client/delete.js
// Heartbeat function, update everytime.
    socket.on('0', function (target) {
        currentPlayer.lastHeartbeat = new Date().getTime();
        if (target.x !== currentPlayer.x || target.y !== currentPlayer.y) {
            currentPlayer.target = target;
        }
    });

    /*................................. to test the latency.................................*/

//see also client/app.js (who send 'ping'), and client/chat.js(who receive 'pong')
    socket.on('ping', function () {
        socket.emit('pong');
    });


};

/***********************************************************************END SOCKET*************************************************************************/
/************************************************************************************************************************************************/

