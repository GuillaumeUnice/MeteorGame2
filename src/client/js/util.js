/***********
 *#################
 *  Variables
 *  ###############
 */
var KEY_ENTER = 13, KEY_FIREFOOD = 32, KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40;

var MIN_SM_WIDTH = 320, MAX_SM_WIDTH = 767, MIN_MD_WIDTH = 768, MAX_MD_WIDTH = 1024;

var MAX_ASSET = 100, BAR_WIDTH = 500, BAR_HEIGHT = 150;

var socket, playerName, playerType;

var playerNameInput = document.getElementById('playerNameInput'), askingPlayer = false, connectedToOthers = false;

var reSend = true, borderDraw = true, animLoopHandle;

var screenWidth = window.innerWidth, screenHeight = window.innerHeight;

var gameWidth = 0, gameHeight = 0;

var xoffset = -gameWidth, yoffset = -gameHeight;

var gameStart = false, disconnected = false, died = false, kicked = false;

// TODO: Break out into GameControls.
var continuity = false, backgroundColor = '#010117', lineColor = '#000000', borderColor = '#FFFFFF';

/**
 * When a player asks for regrouping, this represents the possible lead when the current player accepts
 * @type {undefined}
 */
var possibleAlly = undefined;

var playerConfig = {
    borderColor: '#000000'
}, player = {
    id: -1,
    x: screenWidth / 2,
    y: screenHeight / 2,
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    target: {x: screenWidth / 2, y: screenHeight / 2}
};

var assets = [];
var bombs = [];
var bulletsToDraw = [];
var users = [];
var leaderboard = [];
var target = {x: player.x, y: player.y};
var directionLock = true;
var directions = [];

var gameCanvas = document.getElementById('gameArea'), miniMap = document.getElementById("minimap");

var graph = gameCanvas.getContext('2d'), miniMapFrame = miniMap.getContext("2d");

/**
 *#############
 * Functions
 * ############
 */

/**
 *
 */
var updateLife = function () {
    var lifeBar = document.getElementById('lifeBar');

    if (onSmartphone() || onTablet()) {
        lifeBar.style.height = (player.life * BAR_HEIGHT / MAX_ASSET) + 'px';
        lifeBar.style.width = '5px';
    }
    if (onDesktop()) {
        lifeBar.style.width = (player.life * BAR_WIDTH / MAX_ASSET) + 'px';
        lifeBar.style.height = '5px';
    }
    document.getElementById('lifePoint').innerHTML = player.life;
};

var updateMunition = function () {
    var munitionBar = document.getElementById('munitionBar');

    if (onSmartphone() || onTablet()) {
        munitionBar.style.height = (player.munitions * BAR_HEIGHT / MAX_ASSET) + 'px';
        munitionBar.style.width = '5px'
    }
    if (onDesktop()) {
        munitionBar.style.width = (player.munitions * BAR_WIDTH / MAX_ASSET) + 'px';
        munitionBar.style.height = '5px';
    }

    document.getElementById('munitionPoint').innerHTML = player.munitions;

};

var updatePoints = function () {
    updateLife();
    updateMunition();
};


var onSmartphone = function () {
    return screenWidth >= MIN_SM_WIDTH && screenWidth <= MAX_SM_WIDTH;
};

var onTablet = function () {
    return screenWidth >= MIN_SM_WIDTH && screenWidth <= MAX_MD_WIDTH;
};

var onDesktop = function () {
    return screenWidth >= MIN_MD_WIDTH;
};

var onProjector = function () {
    return screenWidth >= 1200;
};

var printMessage = function (message) {
    graph.fillStyle = '#333333';
    graph.fillRect(0, 0, screenWidth, screenHeight);
    graph.textAlign = 'center';
    graph.fillStyle = '#FFFFFF';
    graph.font = 'bold 30px sans-serif';
    graph.fillText(message, screenWidth / 2, screenHeight / 2);
};