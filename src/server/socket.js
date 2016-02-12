'use strict';

var io = require('socket.io');

// Import game settings.
var gameSettings = require('../../config.json'), util = require('./lib/util'), quadtree = require('./../../quadtree');
var usersInRegroup = [];


function Socket(httpServer, users, bullets, food, virus, object, sockets) {
    var globalSocket = this.mySocket = io(httpServer);

    //This method is called when user is connected
    this.mySocket.of("/").on('connection', function (socket) {
        console.log('A user connected is !', socket.handshake.query.type);

        //initialize a player
        var type = socket.handshake.query.type;
        var radius = util.massToRadius(gameSettings.defaultPlayerMass);
        var position = gameSettings.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);
        var cells = [];
        var massTotal = 0;
        if (type === 'player') {
            cells = [{
                mass: gameSettings.defaultPlayerMass,
                x: position.x,
                y: position.y,
                radius: radius
            }];
            massTotal = gameSettings.defaultPlayerMass;
        }

        var currentPlayer = {
            id: socket.id,
            x: position.x,
            y: position.y,
            munitions: gameSettings.munition,
            life: gameSettings.life,
            cells: cells,
            isRegrouped: {value: false, lead: undefined, isLead: false},
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
            } else if (!util.validNickName(player.name)) {
                socket.emit('kick', 'Invalid username.');
                socket.disconnect();
            } else {
                console.log('[INFO] Player ' + player.name + ' connected!');
                sockets[player.id] = socket;

                var radius = util.massToRadius(gameSettings.defaultPlayerMass);
                var position = gameSettings.newPlayerInitialPosition == 'farthest' ? util.uniformPosition(users, radius) : util.randomPosition(radius);

                player.x = position.x;
                player.y = position.y;
                player.target.x = 0;
                player.target.y = 0;
                if (type === 'player') {
                    player.cells = [{
                        mass: gameSettings.defaultPlayerMass,
                        x: position.x,
                        y: position.y,
                        radius: radius
                    }];
                    player.massTotal = gameSettings.defaultPlayerMass;
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

                socket.emit('playerJoin', {name: currentPlayer.name});

                socket.emit('gameSetup', {
                    gameWidth: gameSettings.gameWidth,
                    gameHeight: gameSettings.gameHeight
                });


                console.log('Total players: ' + users.length);
                console.log(users);
            }

        });

        //if client disconnects
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

        /*................................. yeah! let's play together!.................................*/

        //shoot, client call this in client/app.js
        socket.on('1', function (player) {
            if (!currentPlayer.isRegrouped.value) {
                for (var j = 0; j < currentPlayer.cells.length; j++) {
                    if (currentPlayer.munitions > 0) {

                        currentPlayer.munitions -= 1;

                        var bulletTarget = {
                            x: currentPlayer.x - currentPlayer.cells[j].x,
                            y: currentPlayer.y - currentPlayer.cells[j].y
                        };

                        switch (player.orientation) {
                            case 'right' :
                                bulletTarget.x += 500;
                                break;
                            case 'left' :
                                bulletTarget.x -= 500;
                                break;
                            case 'down' :
                                bulletTarget.y += 500;
                                break;
                            case 'up' :
                            default :
                                bulletTarget.y -= 500;
                                break;
                        }

                        console.log('Bullet orientation ', player.orientation);

                        socket.emit('fire', currentPlayer);
                        bullets.push({
                            id: currentPlayer.id,
                            num: j,
                            target: bulletTarget,
                            x: currentPlayer.cells[j].x,
                            y: currentPlayer.cells[j].y,
                            speed: 50
                        });

                    }
                }
            } else {
                var attackingPlayerSocket = sockets[currentPlayer.isRegrouped.lead];
                var attackingPlayerIndex = util.findIndex(users, currentPlayer.isRegrouped.lead);
                if (attackingPlayerIndex !== -1) {
                    var attackingPlayer = users[attackingPlayerIndex];
                    if (currentPlayer.munitions > 0) {

                        currentPlayer.munitions -= 1;
                        socket.emit('fire', currentPlayer);
                        for (var i = 0; i < attackingPlayer.cells.length; i++) {
                            var masa = 1;
                            if (attackingPlayer.munitions > 0) {

                                masa = attackingPlayer.cells[i].mass * 0.1;

                                attackingPlayer.munitions -= 1;
                                attackingPlayerSocket.emit('fire', attackingPlayer);
                                bullets.push({
                                    id: attackingPlayer.id,
                                    num: i,
                                    masa: masa,
                                    hue: attackingPlayer.hue,
                                    target: {
                                        x: attackingPlayer.x - attackingPlayer.cells[i].x + attackingPlayer.target.x + 200,
                                        y: attackingPlayer.y - attackingPlayer.cells[i].y + attackingPlayer.target.y + 200
                                    },
                                    x: attackingPlayer.cells[i].x,
                                    y: attackingPlayer.cells[i].y,
                                    radius: util.massToRadius(masa),
                                    speed: 50
                                });

                            }
                        }
                    }
                }


                console.log(currentPlayer.name, ' is now part of a super space ship');
            }
        });


        // keyboard action, to change direction, see also client/delete.js
        // Heartbeat function, update everytime.
        /*................................. to test the latency.................................*/

        socket.on('0', function (target) {
            //currentPlayer.lastHeartbeat = new Date().getTime();
            if (target.x !== currentPlayer.x || target.y !== currentPlayer.y) {
                currentPlayer.target = target;
            }
        });

        socket.on('regroupPlayers', function () {

            if (users.length > 1) {
                console.log(currentPlayer.name + ' asked for a super spaceship');
                currentPlayer.isRegrouped = {value: true, lead: currentPlayer.id, isLead: true};
                currentPlayer.x = 2500;
                currentPlayer.y = 2500;
                usersInRegroup[currentPlayer.id] = 1;
                socket.broadcast.emit('proposeJoin', currentPlayer);

            }

        });


        socket.on('acceptJoin', function (possibleAlly) {
            if (usersInRegroup[possibleAlly.id] < 4) {

                currentPlayer.isRegrouped = {value: true, lead: possibleAlly.id};
                usersInRegroup[possibleAlly.id] += 1;

                socket.emit('regroupAccepted', currentPlayer);

                if (usersInRegroup[possibleAlly.id] == 4) {
                    console.log('The super spaceship lead by ', possibleAlly.name, 'is now full');
                    var leader = possibleAlly;
                    leader.munitions *= 3;
                    leader.life *= 3;
                    globalSocket.emit('teamFull', leader);
                }
            }
        });


    });
}

exports.Socket = Socket;
