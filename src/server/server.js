/*jslint bitwise: true, node: true */
'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var SAT = require('sat');

// Import game settings.
var c = require('../../config.json');

// Import utilities.
var util = require('./lib/util');

// Import quadtree.
var quadtree = require('../../quadtree');

/* My imports */
var mapElemImport = require("./mapElements.js");

//game attribute
var args = {x: 0, y: 0, h: c.gameHeight, w: c.gameWidth, maxChildren: 1, maxDepth: 5};

console.log(args);

var tree = quadtree.QUAD.init(args);

var users = [];
var superVessel = [];
var massFood = [];
var food = [];
var virus = [];
var sockets = {};

var leaderboard = [];
var leaderboardChanged = false;

var V = SAT.Vector;
var C = SAT.Circle;

var initMassLog = util.log(c.defaultPlayerMass, c.slowBase);

app.use(express.static(__dirname + '/../client'));

var endGame= false;

//SOCKET IMPORT ATTEMPT
//io.on('connection', function (socket) {socketImport.ioon(socket,c,users,sockets);});

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

//This method is called the first time the user is connected
io.on('connection', function (socket) {
    console.log('A user connected is !', socket.handshake.query.type);
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
        munitions: c.munition,
        life: c.life,
        cells: cells,
        isInSuperVessel: false,
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
            console.log(users);
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

    /*................................. yeah! let's play together!.................................*/

//shoot, client call this in client/app.js
    socket.on('1', function () {
        console.log('Fire called');
        // Fire food.


        //A DEPLACER (TEST)
        wound(3);

        for (var i = 0; i < currentPlayer.cells.length; i++) {
            //if (((currentPlayer.cells[i].mass >= c.defaultPlayerMass + c.fireFood) && c.fireFood > 0) || (currentPlayer.cells[i].mass >= 20 && c.fireFood === 0)) {
            var masa = 1;
            if (currentPlayer.munitions > 0) {

                masa = currentPlayer.cells[i].mass * 0.1;
                /*currentPlayer.cells[i].mass -= masa;
                 currentPlayer.massTotal -= masa;*/
                currentPlayer.munitions -= 1;
                console.log('[INFO] User :: ' + currentPlayer.name + ' :: Remaining munitions : ', currentPlayer.munitions);

                socket.emit('fire', currentPlayer);
                massFood.push({
                    id: currentPlayer.id,
                    num: i,
                    masa: masa,
                    hue: currentPlayer.hue,
                    target: {
                        x: currentPlayer.x - currentPlayer.cells[i].x + currentPlayer.target.x+200,
                        y: currentPlayer.y - currentPlayer.cells[i].y + currentPlayer.target.y+200
                    },
                    x: currentPlayer.cells[i].x,
                    y: currentPlayer.cells[i].y,
                    radius: util.massToRadius(masa),
                    speed: 40
                });

            } else {
                console.log("No more munitions");
                socket.emit('noAmmo');
            }
            //}
        }
    });

    /*
        wounds the currentPlayer
     */
    function wound(nb){
        //end the game if the player is dead
        if(currentPlayer.life -nb <=0 ){
            endGame=true;
        }else{
            //else change the player's life and send info
            currentPlayer.life-=nb;
            socket.emit('wound',currentPlayer);
        }

    }

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

    socket.on('regroupPlayers', function () {
        console.log('Server regroup called');
        if (users.length > 1) {
            console.log(currentPlayer.name + ' asked for a super vessel');

            superVessel.push(currentPlayer);
            superVessel[0].role = 'pilot';
            socket.broadcast.emit('proposeJoin', currentPlayer);

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

    socket.on('acceptJoin', function () {
        if (superVessel.length < 4) {


            console.log('Asking player : ', superVessel[0].name);
            console.log('Accepting player : ', currentPlayer.name);
            currentPlayer.isInSuperVessel = true;
            currentPlayer.isDisplayer = false;

            superVessel.push(currentPlayer);
            console.log('Remaining places : ', 4 - superVessel.length + ' / 4 ');
            if (superVessel.length == 4) {
                console.log('The super vessel is now ready');
                var displayer = 0;
                for (var i = 1; i < superVessel.length; i++) {
                    if (superVessel[i].screenWidth > superVessel[displayer].screenWidth) {
                        superVessel[displayer].isDisplayer = false;
                        superVessel[i].isDisplayer = true;
                        displayer = i;

                    }
                }

                //on affecte les nouvelles positions
                superVessel[0].x = c.gameWidth / 2;
                superVessel[0].y = c.gameHeight / 2;


                superVessel[1].x = superVessel[0].x + 640;
                superVessel[1].y = superVessel[0].y;

                superVessel[2].x = superVessel[0].x + 320;
                superVessel[2].y = superVessel[0].y - 320;

                superVessel[3].x = superVessel[2].x;
                superVessel[3].y = superVessel[0].y + 320;

                console.log("The super vessel members");
                console.log(superVessel);

                io.emit('teamFull', superVessel);

            }
        } else {
            console.log('The team is complete');
            //socket.emit('teamFull', superVessel);
        }
    });


});
/***********************************************************************END SOCKET*************************************************************************/
//noinspection JSDuplicatedDeclaration
/******/


function moveMass(mass) {
    var deg = Math.atan2(mass.target.y, mass.target.x);
    var deltaY = mass.speed * Math.sin(deg);
    var deltaX = mass.speed * Math.cos(deg);

    mass.speed -= 0.5;
    if (mass.speed < 0) {
        mass.speed = 0;
    }
    if (!isNaN(deltaY)) {
        mass.y += deltaY;
    }
    if (!isNaN(deltaX)) {
        mass.x += deltaX;
    }

    var borderCalc = mass.radius + 5;

    if (mass.x > c.gameWidth - borderCalc) {
        mass.x = c.gameWidth - borderCalc;
    }
    if (mass.y > c.gameHeight - borderCalc) {
        mass.y = c.gameHeight - borderCalc;
    }
    if (mass.x < borderCalc) {
        mass.x = borderCalc;
    }
    if (mass.y < borderCalc) {
        mass.y = borderCalc;
    }
}


/*................................called in function tickPlayer......................................................*/


function movePlayer(player) {
    var x = 0, y = 0;
    for (var i = 0; i < player.cells.length; i++) {
        var target = {
            x: player.x - player.cells[i].x + player.target.x,
            y: player.y - player.cells[i].y + player.target.y
        };
        var dist = Math.sqrt(Math.pow(target.y, 2) + Math.pow(target.x, 2));
        var deg = Math.atan2(target.y, target.x);
        var slowDown = 1;
        if (player.cells[i].speed <= 6.25) {
            slowDown = util.log(player.cells[i].mass, c.slowBase) - initMassLog + 1;
        }

        var deltaY = player.cells[i].speed * Math.sin(deg) / slowDown;
        var deltaX = player.cells[i].speed * Math.cos(deg) / slowDown;

        if (player.cells[i].speed > 6.25) {
            player.cells[i].speed -= 0.5;
        }
        if (dist < (50 + player.cells[i].radius)) {
            deltaY *= dist / (50 + player.cells[i].radius);
            deltaX *= dist / (50 + player.cells[i].radius);
        }
        if (!isNaN(deltaY)) {
            player.cells[i].y += deltaY;
        }
        if (!isNaN(deltaX)) {
            player.cells[i].x += deltaX;
        }
        // Find best solution.
        for (var j = 0; j < player.cells.length; j++) {
            if (j != i && player.cells[i] !== undefined) {
                var distance = Math.sqrt(Math.pow(player.cells[j].y - player.cells[i].y, 2) + Math.pow(player.cells[j].x - player.cells[i].x, 2));
                var radiusTotal = (player.cells[i].radius + player.cells[j].radius);
                if (distance < radiusTotal) {
                    if (player.lastSplit > new Date().getTime() - 1000 * c.mergeTimer) {
                        if (player.cells[i].x < player.cells[j].x) {
                            player.cells[i].x--;
                        } else if (player.cells[i].x > player.cells[j].x) {
                            player.cells[i].x++;
                        }
                        if (player.cells[i].y < player.cells[j].y) {
                            player.cells[i].y--;
                        } else if ((player.cells[i].y > player.cells[j].y)) {
                            player.cells[i].y++;
                        }
                    }
                    else if (distance < radiusTotal / 1.75) {
                        player.cells[i].mass += player.cells[j].mass;
                        player.cells[i].radius = util.massToRadius(player.cells[i].mass);
                        player.cells.splice(j, 1);
                    }
                }
            }
        }
        if (player.cells.length > i) {
            var borderCalc = player.cells[i].radius / 3;
            if (player.cells[i].x > c.gameWidth - borderCalc) {
                player.cells[i].x = c.gameWidth - borderCalc;
            }
            if (player.cells[i].y > c.gameHeight - borderCalc) {
                player.cells[i].y = c.gameHeight - borderCalc;
            }
            if (player.cells[i].x < borderCalc) {
                player.cells[i].x = borderCalc;
            }
            if (player.cells[i].y < borderCalc) {
                player.cells[i].y = borderCalc;
            }
            x += player.cells[i].x;
            y += player.cells[i].y;
        }
    }
    player.x = x / player.cells.length;
    player.y = y / player.cells.length;
}

/*...................START OF TICK, this function is called in moveloop..................................................................................................*/
function tickPlayer(currentPlayer) {
    if (currentPlayer.lastHeartbeat < new Date().getTime() - c.maxHeartbeatInterval) {
        sockets[currentPlayer.id].emit('kick', 'Last heartbeat received over ' + c.maxHeartbeatInterval + ' ago.');
        sockets[currentPlayer.id].disconnect();
    }

    movePlayer(currentPlayer);

    function funcFood(f) {
        return SAT.pointInCircle(new V(f.x, f.y), playerCircle);
    }

    function deleteFood(f) {
        food[f] = {};
        food.splice(f, 1);
    }

    function eatMass(m) {
        if (SAT.pointInCircle(new V(m.x, m.y), playerCircle)) {
            if (m.id == currentPlayer.id && m.speed > 0 && z == m.num)
                return false;
            if (currentCell.mass > m.masa * 1.1)
                return true;
        }
        return false;
    }

    function check(user) {
        for (var i = 0; i < user.cells.length; i++) {
            if (user.cells[i].mass > 10 && user.id !== currentPlayer.id) {
                var response = new SAT.Response();
                var collided = SAT.testCircleCircle(playerCircle,
                    new C(new V(user.cells[i].x, user.cells[i].y), user.cells[i].radius),
                    response);
                if (collided) {
                    response.aUser = currentCell;
                    response.bUser = {
                        id: user.id,
                        name: user.name,
                        x: user.cells[i].x,
                        y: user.cells[i].y,
                        num: i,
                        mass: user.cells[i].mass
                    };
                    playerCollisions.push(response);
                }
            }
        }
    }

    /*....................collision logic..............................*/
    function collisionCheck(collision) {

        //Kill result depends on the ball size of player
        if (collision.aUser.mass > collision.bUser.mass * 1.1 && collision.aUser.radius > Math.sqrt(Math.pow(collision.aUser.x - collision.bUser.x, 2) + Math.pow(collision.aUser.y - collision.bUser.y, 2)) * 1.75) {
            console.log('[DEBUG] Killing user: ' + collision.bUser.id);
            console.log('[DEBUG] Collision info:');
            console.log(collision);

            var numUser = util.findIndex(users, collision.bUser.id);
            if (numUser > -1) {
                if (users[numUser].cells.length > 1) {
                    users[numUser].massTotal -= collision.bUser.mass;
                    users[numUser].cells.splice(collision.bUser.num, 1);
                } else {
                    users.splice(numUser, 1);
                    io.emit('playerDied', {name: collision.bUser.name});
                    sockets[collision.bUser.id].emit('RIP');
                }
            }
            currentPlayer.massTotal += collision.bUser.mass;
            collision.aUser.mass += collision.bUser.mass;
        }
    }

    for (var z = 0; z < currentPlayer.cells.length; z++) {
        var currentCell = currentPlayer.cells[z];
        var playerCircle = new C(
            new V(currentCell.x, currentCell.y),
            currentCell.radius
        );

        var foodEaten = food.map(funcFood)
            .reduce(function (a, b, c) {
                return b ? a.concat(c) : a;
            }, []);

        foodEaten.forEach(deleteFood);

        var massEaten = massFood.map(eatMass)
            .reduce(function (a, b, c) {
                return b ? a.concat(c) : a;
            }, []);

        var masaGanada = 0;
        for (var m = 0; m < massEaten.length; m++) {
            masaGanada += massFood[massEaten[m]].masa;
            massFood[massEaten[m]] = {};
            massFood.splice(massEaten[m], 1);
            for (var n = 0; n < massEaten.length; n++) {
                if (massEaten[m] < massEaten[n]) {
                    massEaten[n]--;
                }
            }
        }

        if (typeof(currentCell.speed) == "undefined")
            currentCell.speed = 6.25;
        masaGanada += (foodEaten.length * c.foodMass);
        currentCell.mass += masaGanada;
        currentPlayer.massTotal += masaGanada;
        currentCell.radius = util.massToRadius(currentCell.mass);
        playerCircle.r = currentCell.radius;

        tree.clear();
        tree.insert(users);
        var playerCollisions = [];

        var otherUsers = tree.retrieve(currentPlayer, check);

        playerCollisions.forEach(collisionCheck);
    }

}
/*.................................END OF TICK ..................................................................................*/

/*......................loopS.......................................................*/
function moveloop() {
    for (var i = 0; i < users.length; i++) {
        tickPlayer(users[i]);
    }
    for (i = 0; i < massFood.length; i++) {
        if (massFood[i].speed > 0) moveMass(massFood[i]);
    }
}

function gameloop() {
    if(!endGame){

        if (users.length > 0) {
            users.sort(function (a, b) {
                return b.massTotal - a.massTotal;
            });

            var topUsers = [];

            for (var i = 0; i < Math.min(10, users.length); i++) {
                if (users[i].type == 'player') {
                    topUsers.push({
                        id: users[i].id,
                        name: users[i].name,
                        x: users[i].x,
                        y: users[i].y
                    });
                }
            }
            if (isNaN(leaderboard) || leaderboard.length !== topUsers.length) {
                leaderboard = topUsers;
                leaderboardChanged = true;
            }
            else {
                for (i = 0; i < leaderboard.length; i++) {
                    if (leaderboard[i].id !== topUsers[i].id) {
                        leaderboard = topUsers;
                        leaderboardChanged = true;
                        break;
                    }
                }
            }
            for (i = 0; i < users.length; i++) {
                for (var z = 0; z < users[i].cells.length; z++) {
                    if (users[i].cells[z].mass * (1 - (c.massLossRate / 1000)) > c.defaultPlayerMass) {
                        var massLoss = users[i].cells[z].mass * (1 - (c.massLossRate / 1000));
                        users[i].massTotal -= users[i].cells[z].mass - massLoss;
                        users[i].cells[z].mass = massLoss;
                    }
                }
            }
        }
    }
    else{
        users.forEach(function(u){
            sockets[u.id].emit('gameOver');
        });
        endGame = false;
    }
    balanceMass(c, food, users);
}



/* TODO : exporter cette fonction dans un autre fichier, mais pas dans mapElements car cela ferai une "dépendance circulaire"*/
/*.................................................balanceMass,called in gameloop......................................................*/
function balanceMass(c, food, users) {
    var totalMass = food.length * c.foodMass +
        users
            .map(function (u) {
                return u.massTotal;
            })
            .reduce(function (pu, cu) {
                return pu + cu;
            }, 0);

    var massDiff = c.gameMass - totalMass;     //gameMass = 20000
    var maxFoodDiff = c.maxFood - food.length; //maxFood = 20
    var foodDiff = parseInt(massDiff / c.foodMass) - maxFoodDiff;
    var foodToAdd = Math.min(foodDiff, maxFoodDiff);
    var foodToRemove = -Math.max(foodDiff, maxFoodDiff);

    if (foodToAdd > 0) {
        //console.log('[DEBUG] Adding ' + foodToAdd + ' food to level!');
        mapElemImport.addFood(foodToAdd, c, food);
        //console.log('[DEBUG] Mass rebalanced!');
    }
    else if (foodToRemove > 0) {
        //console.log('[DEBUG] Removing ' + foodToRemove + ' food from level!');
        mapElemImport.removeFood(foodToRemove, food);
        //console.log('[DEBUG] Mass rebalanced!');
    }

    var virusToAdd = c.maxVirus - virus.length;

    if (virusToAdd > 0) {
        mapElemImport.addVirus(virusToAdd, c, virus);
    }
}


/*.................................................update canvas..............................................................*/
function sendUpdates() {
    users.forEach(function (u) {


        // center the view if x/y is undefined, this will happen for spectators
        u.x = u.x || c.gameWidth / 2;
        u.y = u.y || c.gameHeight / 2;

        var visibleFood = food
            .map(function (f) {
                if (f.x > u.x - u.screenWidth / 2 - 20 &&
                    f.x < u.x + u.screenWidth / 2 + 20 &&
                    f.y > u.y - u.screenHeight / 2 - 20 &&
                    f.y < u.y + u.screenHeight / 2 + 20) {
                    return f;
                }
            })
            .filter(function (f) {
                return f;
            });

        var visibleVirus = virus
            .map(function (f) {
                if (f.x > u.x - u.screenWidth / 2 - f.radius &&
                    f.x < u.x + u.screenWidth / 2 + f.radius &&
                    f.y > u.y - u.screenHeight / 2 - f.radius &&
                    f.y < u.y + u.screenHeight / 2 + f.radius) {
                    return f;
                }
            })
            .filter(function (f) {
                return f;
            });

        var visibleMass = massFood
            .map(function (f) {
                if (f.x + f.radius > u.x - u.screenWidth / 2 - 20 &&
                    f.x - f.radius < u.x + u.screenWidth / 2 + 20 &&
                    f.y + f.radius > u.y - u.screenHeight / 2 - 20 &&
                    f.y - f.radius < u.y + u.screenHeight / 2 + 20) {
                    return f;
                }
            })
            .filter(function (f) {
                return f;
            });

        var visibleCells = users
            .map(function (f) {
                for (var z = 0; z < f.cells.length; z++) {
                    if (f.cells[z].x + f.cells[z].radius > u.x - u.screenWidth / 2 - 20 &&
                        f.cells[z].x - f.cells[z].radius < u.x + u.screenWidth / 2 + 20 &&
                        f.cells[z].y + f.cells[z].radius > u.y - u.screenHeight / 2 - 20 &&
                        f.cells[z].y - f.cells[z].radius < u.y + u.screenHeight / 2 + 20) {
                        z = f.cells.lenth;
                        if (f.id !== u.id) {
                            return {
                                id: f.id,
                                x: f.x,
                                y: f.y,
                                cells: f.cells,
                                massTotal: Math.round(f.massTotal),
                                hue: f.hue,
                                name: f.name,
                                isInSuperVessel: f.isInSuperVessel,
                                isDisplayer: f.isDisplayer
                            };
                        } else {
                            //console.log("Nombre: " + f.name + " Es Usuario");
                            return {
                                x: f.x,
                                y: f.y,
                                cells: f.cells,
                                massTotal: Math.round(f.massTotal),
                                hue: f.hue,
                                isInSuperVessel: f.isInSuperVessel,
                                isDisplayer: f.isDisplayer
                            };
                        }
                    }
                }
            })
            .filter(function (f) {
                return f;
            });

        sockets[u.id].emit('serverTellPlayerMove', visibleCells, visibleFood, visibleMass, visibleVirus);
        if (leaderboardChanged) {
            sockets[u.id].emit('leaderboard', {
                players: users.length,
                leaderboard: leaderboard
            });
        }
    });
    leaderboardChanged = false;
}
/*.........................HERE WE CALL ALL THE FUNCTION ABOVE...........................................................................................*/
setInterval(moveloop, 1000 / 60);
setInterval(gameloop, 1000);
setInterval(sendUpdates, 1000 / c.networkUpdateFactor);

/*........................................ Don't touch, IP configurations..........................................*/
//Bind to this IP address in order to receive traffic from the routing layer
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1';
//Listen on this port to recieve traffic from the routing layer
var serverport = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || c.port;
if (process.env.OPENSHIFT_NODEJS_IP !== undefined) {
    http.listen(serverport, ipaddress, function () {
        console.log('[DEBUG] Listening on *:' + serverport);
    });
} else {
    http.listen(serverport, function () {
        console.log('[DEBUG] Listening on *:' + c.port);
    });
}
