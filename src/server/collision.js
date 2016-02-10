'use strict';

var SAT = require('sat'), gameSettings = require('../../config.json'), util = require('./lib/util'), quadtree = require('./../../quadtree');

//game attribute
var starUpArgs = {x: 0, y: 0, h: gameSettings.gameHeight, w: gameSettings.gameWidth, maxChildren: 1, maxDepth: 5};

var tree = quadtree.QUAD.init(starUpArgs);

var SATVector = SAT.Vector,
    SATCircle = SAT.Circle;

var initMassLog = util.log(gameSettings.defaultPlayerMass, gameSettings.slowBase);

function first(obj) {
    for (var a in obj) return a;
}

function movePlayer(player) {
    var x = 0, y = 0;
    for (var i = 0; i < player.cells.length; i++) {
        var target = {
                x: player.x - player.cells[i].x + player.target.x,
                y: player.y - player.cells[i].y + player.target.y
            }, dist = Math.sqrt(Math.pow(target.y, 2) + Math.pow(target.x, 2)), deg = Math.atan2(target.y, target.x),
            slowDown = 1, deltaY = player.cells[i].speed * Math.sin(deg) / slowDown,
            deltaX = player.cells[i].speed * Math.cos(deg) / slowDown;

        if (player.cells[i].speed <= 6.25) {
            slowDown = util.log(player.cells[i].mass, gameSettings.slowBase) - initMassLog + 1;
        }


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
                    if (player.lastSplit > new Date().getTime() - 1000 * gameSettings.mergeTimer) {
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
            if (player.cells[i].x > gameSettings.gameWidth - borderCalc - 210) {
                player.cells[i].x = gameSettings.gameWidth - borderCalc - 210;
            }
            if (player.cells[i].y > gameSettings.gameHeight - borderCalc - 200) {
                player.cells[i].y = gameSettings.gameHeight - borderCalc - 200;
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


exports.tickPlayer = function (currentPlayer, users, massFood, food, virus, object, sockets, endGame, io) {

    movePlayer(currentPlayer);

    function funcFood(f) {
        return SAT.pointInCircle(new SATVector(f.x, f.y), playerCircle);
    }

    function deleteFood(f) {
        food[f] = {};
        food.splice(f, 1);
    }

    //Get wounded by bullet of enemie
    function eatMass(m) {

        if (SAT.pointInCircle(new SATVector(m.x, m.y), playerCircle)) {

            if (m.id != currentPlayer.id) {
                currentPlayer.life -= 10;
                sockets[currentPlayer.id].emit('explosion', currentPlayer);
                if (currentPlayer.life < 1) {
                    sockets[currentPlayer.id].emit('RIP', currentPlayer);
                    users.splice(currentPlayer.id, 1);

                } else {
                    sockets[currentPlayer.id].emit('wound', currentPlayer);
                }
            }

            if (m.id == currentPlayer.id && m.speed > 0 && z == m.num)
                return false;
            if (currentCell.mass > m.masa * 1.1)
                return true;
        }
        return false;
    }

    //Detecter the confilt
    function check(user) {
        //   console.log("check");
        var response = new SAT.Response();
        var collided = undefined;
        for (var j = 0; j < user.cells.length; j++) {
            if (user.cells[j].mass > 10 && user.id !== currentPlayer.id) {
                collided = SAT.testCircleCircle(playerCircle,
                    new SATCircle(new SATVector(user.cells[j].x, user.cells[j].y), user.cells[j].radius),
                    response);

                if (collided) {
                    response.aUser = currentCell;
                    response.bUser = {
                        id: user.id,
                        name: user.name,
                        x: user.cells[j].x,
                        y: user.cells[j].y,
                        num: j,
                        mass: user.cells[j].mass
                    };
                    playerCollisions.push(response);
                }
            }
        }

        for (var i = 0; i < object.length; i++) {
            collided = SAT.testCircleCircle(playerCircle,
                new SATCircle(new SATVector(object[i].x, object[i].y), 50),
                response);

            if (collided) {
                // Get points of life
                if (object[i].type === gameSettings.object.lifeType.name) {
                    var currentLift = currentPlayer.life + gameSettings.object.lifeType.point;
                    currentPlayer.life = (currentLift > gameSettings.life) ? gameSettings.life : currentLift;
                    sockets[currentPlayer.id].emit('wound', currentPlayer);
                }
                //Get points of bullet
                else if (object[i].type === gameSettings.object.bulletType.name) {
                    var currentBullet = currentPlayer.munitions + gameSettings.object.bulletType.point;
                    currentPlayer.munitions = (currentBullet > gameSettings.munition) ? gameSettings.munition : currentBullet;
                    sockets[currentPlayer.id].emit('dropBullet', currentPlayer);
                }
                //Lost points of lift
                else {
                    currentPlayer.life -= gameSettings.object.mineType.point;
                    if (currentPlayer.life <= 0) {
                        endGame = true;
                    }
                    sockets[currentPlayer.id].emit('wound', currentPlayer);
                }

                object.splice(object.indexOf(object[i]), 1);
            }
        }
    }


    //....................collision logic..............................
    function collisionCheck(collision) {
        //console.log("collisionCheck");

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
                    sockets[currentPlayer.id]('playerDied', {name: collision.bUser.name});
                    sockets[collision.bUser.id].emit('RIP');
                }
            }
            currentPlayer.massTotal += collision.bUser.mass;
            collision.aUser.mass += collision.bUser.mass;
        }
    }


    for (var z = 0; z < currentPlayer.cells.length; z++) {
        var currentCell = currentPlayer.cells[z];
        var playerCircle = new SATCircle(
            new SATVector(currentCell.x, currentCell.y), 250
            //  currentCell.radius
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
        masaGanada += (foodEaten.length * gameSettings.foodMass);
        currentCell.mass += masaGanada;
        currentPlayer.massTotal += masaGanada;
        currentCell.radius = util.massToRadius(currentCell.mass);
        playerCircle.r = currentCell.radius;

        tree.clear();
        tree.insert(users);
        var playerCollisions = [];

        //Get all the collision with other users
        tree.retrieve(currentPlayer, check);
        for (var i = 0; i < playerCollisions.length; i++) {
            collisionCheck(playerCollisions[i]);
        }

    }

    if (endGame) {
        return true;
    }
};