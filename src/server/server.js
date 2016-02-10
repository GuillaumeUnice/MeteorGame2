/*jslint bitwise: true, node: true */
'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);

var collision = require('./collision.js');

// Import game settings.
var gameSettings = require('../../config.json'), util = require('./lib/util'), quadtree = require('./../../quadtree');

/* My imports */
var mapElemImport = require("./mapElements.js"), objectImport = require("./object.js");

var users = [], bullets = [], food = [], virus = [], object = [], sockets = {};

var leaderBoard = [], leaderboardChanged = false;

var endGame = false;

var socket = require('./socket.js');

var io = new socket.Socket(http, users, bullets, food, virus, object, sockets);


app.use(express.static(__dirname + '/../client'));


function moveBullet() {
    var i;
    for (i = 0; i < bullets.length; i++) {
        if (bullets[i].speed > 0) {

            var bullet = bullets[i];

            var deg = Math.atan2(bullet.target.y, bullet.target.x);
            var deltaY = bullet.speed * Math.sin(deg);
            var deltaX = bullet.speed * Math.cos(deg);

            if (bullet.speed < 0) {
                bullet.speed = 0;
            }
            if (!isNaN(deltaY)) {
                bullet.y += deltaY;
            }
            if (!isNaN(deltaX)) {
                bullet.x += deltaX;
            }

            var borderCalc = bullet.radius + 5;


            if (bullet.x > gameSettings.gameWidth - borderCalc || bullet.y > gameSettings.gameHeight - borderCalc || bullet.x < borderCalc || bullet.y < borderCalc) {
                bullets.splice(i, 1);
            }

        }
    }

}


/*......................loopS.......................................................*/
function moveLoop() {
    for (var i = 0; i < users.length; i++) {
        //console.log(object);
        if (object !== undefined) {
            var res = collision.tickPlayer(users[i], users, bullets, food, virus, object, sockets, endGame, io);
            if (res) {
                console.log("fin de gameeeeeeeeeeeeeeeeeeeee");
                endGame = true;
            }
        }

    }
    moveBullet();

}

function gameloop() {
    if (!endGame) {

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
                        y: users[i].y,
                        isRegrouped: users[i].isRegrouped
                    });
                }
            }
            if (isNaN(leaderBoard) || leaderBoard.length !== topUsers.length) {
                leaderBoard = topUsers;
                leaderboardChanged = true;
            }
            else {
                for (i = 0; i < leaderBoard.length; i++) {
                    if (leaderBoard[i].id !== topUsers[i].id) {
                        leaderBoard = topUsers;
                        leaderboardChanged = true;
                        break;
                    }
                }
            }
            for (i = 0; i < users.length; i++) {
                for (var z = 0; z < users[i].cells.length; z++) {
                    if (users[i].cells[z].mass * (1 - (gameSettings.massLossRate / 1000)) > gameSettings.defaultPlayerMass) {
                        var massLoss = users[i].cells[z].mass * (1 - (gameSettings.massLossRate / 1000));
                        users[i].massTotal -= users[i].cells[z].mass - massLoss;
                        users[i].cells[z].mass = massLoss;
                    }
                }
            }
        }
    }
    else {
        users.forEach(function (user) {
            sockets[user.id].emit('gameOver');
        });
        endGame = false;
    }
    balanceMass(gameSettings, food, users);
}

/*.................................................balanceMass,called in gameloop......................................................*/
function balanceMass(configuration, food, users) {
    var totalMass = food.length * configuration.foodMass +
        users
            .map(function (u) {
                return u.massTotal;
            })
            .reduce(function (pu, cu) {
                return pu + cu;
            }, 0);

    var massDiff = configuration.gameMass - totalMass;     //gameMass = 20000
    var maxFoodDiff = configuration.maxFood - food.length; //maxFood = 20
    var foodDiff = parseInt(massDiff / configuration.foodMass) - maxFoodDiff;
    var foodToAdd = Math.min(foodDiff, maxFoodDiff);
    var foodToRemove = -Math.max(foodDiff, maxFoodDiff);

    if (foodToAdd > 0) {
        mapElemImport.addFood(foodToAdd, configuration, food);
    }
    else if (foodToRemove > 0) {
        mapElemImport.removeFood(foodToRemove, food);
    }

    var virusToAdd = configuration.maxVirus - virus.length;

    if (virusToAdd > 0) {
        mapElemImport.addVirus(virusToAdd, configuration, virus);
    }

    var objectToAdd = gameSettings.objectMax - object.length;

    if (objectToAdd > 0) {
        objectImport.addObject(objectToAdd, configuration, object);
    }


}


/*.................................................update canvas..............................................................*/
function sendUpdates() {
    users.forEach(function (userToUpdate) {


        // center the view if x/y is undefined, this will happen for spectators
        userToUpdate.x = userToUpdate.x || gameSettings.gameWidth / 2;
        userToUpdate.y = userToUpdate.y || gameSettings.gameHeight / 2;

        var visibleFood = food
            .map(function (visFood) {
                if (visFood.x > userToUpdate.x - userToUpdate.screenWidth / 2 - 20 &&
                    visFood.x < userToUpdate.x + userToUpdate.screenWidth / 2 + 20 &&
                    visFood.y > userToUpdate.y - userToUpdate.screenHeight / 2 - 20 &&
                    visFood.y < userToUpdate.y + userToUpdate.screenHeight / 2 + 20) {
                    return visFood;
                }
            })
            .filter(function (element) {
                return element;
            });

        var visibleVirus = virus
            .map(function (visVirus) {
                if (visVirus.x > userToUpdate.x - userToUpdate.screenWidth / 2 &&
                    visVirus.x < userToUpdate.x + userToUpdate.screenWidth / 2 &&
                    visVirus.y > userToUpdate.y - userToUpdate.screenHeight / 2 &&
                    visVirus.y < userToUpdate.y + userToUpdate.screenHeight / 2) {
                    return visVirus;
                }
            })
            .filter(function (element) {
                return element;
            });

        var visibleObject = object
            .map(function (visObject) {
                if (visObject.x > userToUpdate.x - userToUpdate.screenWidth / 2 &&
                    visObject.x < userToUpdate.x + userToUpdate.screenWidth / 2 &&
                    visObject.y > userToUpdate.y - userToUpdate.screenHeight / 2 &&
                    visObject.y < userToUpdate.y + userToUpdate.screenHeight / 2) {
                    return visObject;
                }
            })
            .filter(function (element) {

                return element;
            });


        var visibleBullets = bullets
            .map(function (visibleBullet) {
                if (visibleBullet.x > userToUpdate.x - userToUpdate.screenWidth / 2 - 20 &&
                    visibleBullet.x < userToUpdate.x + userToUpdate.screenWidth / 2 + 20 &&
                    visibleBullet.y > userToUpdate.y - userToUpdate.screenHeight / 2 - 20 &&
                    visibleBullet.y < userToUpdate.y + userToUpdate.screenHeight / 2 + 20) {
                    return visibleBullet;
                }
            })
            .filter(function (element) {
                return element;
            });

        var visibleCells = users
            .map(function (user) {
                for (var z = 0; z < user.cells.length; z++) {
                    if (user.cells[z].x > userToUpdate.x - userToUpdate.screenWidth / 2 - 20 &&
                        user.cells[z].x < userToUpdate.x + userToUpdate.screenWidth / 2 + 20 &&
                        user.cells[z].y > userToUpdate.y - userToUpdate.screenHeight / 2 - 20 &&
                        user.cells[z].y < userToUpdate.y + userToUpdate.screenHeight / 2 + 20) {
                        z = user.cells.length;
                        if (user.id !== userToUpdate.id) {
                            return {
                                id: user.id,
                                x: user.x,
                                y: user.y,
                                cells: user.cells,
                                massTotal: Math.round(user.massTotal),
                                hue: user.hue,
                                name: user.name,
                                isRegrouped: user.isRegrouped
                            };
                        } else {
                            return {
                                x: user.x,
                                y: user.y,
                                cells: user.cells,
                                massTotal: Math.round(user.massTotal),
                                hue: user.hue,
                                isRegrouped: user.isRegrouped
                            };
                        }
                    }
                }
            })
            .filter(function (element) {
                return element;
            });

        sockets[userToUpdate.id].emit('serverTellPlayerMove', visibleCells, visibleFood, visibleBullets, visibleVirus, visibleObject);
        if (leaderboardChanged) {
            sockets[userToUpdate.id].emit('leaderboard', {
                players: users.length,
                leaderboard: leaderBoard
            });
        }
    });
    leaderboardChanged = false;
}

/*.........................HERE WE CALL ALL THE FUNCTION ABOVE...........................................................................................*/
setInterval(moveLoop, 1000 / 60);
setInterval(gameloop, 1000);
setInterval(sendUpdates, 1000 / gameSettings.networkUpdateFactor);

/*........................................ Don't touch, IP configurations..........................................*/
//Bind to this IP address in order to receive traffic from the routing layer
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || process.env.IP || '127.0.0.1';
//Listen on this port to recieve traffic from the routing layer
var serverport = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || gameSettings.port;
if (process.env.OPENSHIFT_NODEJS_IP !== undefined) {
    http.listen(serverport, ipaddress, function () {
        console.log('[DEBUG] Listening on *:' + serverport);
    });
} else {
    http.listen(serverport, function () {
        console.log('[DEBUG] Listening on *:' + gameSettings.port);
    });
}