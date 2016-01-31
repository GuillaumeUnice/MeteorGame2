/***********
 * Variables
 */
var KEY_ENTER = 13;
var KEY_FIREFOOD = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var askingPlayer = false;
var playerName;
var playerType;
var playerNameInput = document.getElementById('playerNameInput');
var socket;
var connectedToOthers = false;
var reason;
var reenviar = true;
var borderDraw = true;
var animLoopHandle;
var spin = -Math.PI;
var mobile = false;

var screenWidth = window.innerWidth;
var screenHeight = window.innerHeight;

var gameWidth = 0;
var gameHeight = 0;

var life = 0;

var xoffset = -gameWidth;
var yoffset = -gameHeight;

var gameStart = false;
var disconnected = false;
var died = false;
var kicked = false;

// TODO: Break out into GameControls.
var continuity = false;
var backgroundColor = '#010117';

var lineColor = '#000000';
var borderColor = '#FFFFFF';

var playerConfig = {
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#FF0000',
    textBorderSize: 4,
    defaultSize: 30
};

var player = {
    id: -1,
    x: screenWidth / 2,
    y: screenHeight / 2,
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    target: {x: screenWidth / 2, y: screenHeight / 2}
};
var mySuperVessel = [];
var foods = [];
var viruses = [];
var fireFood = [];
var users = [];
var leaderboard = [];
var target = {x: player.x, y: player.y};
var directionLock = true;
var directions = [];

var gameCanvas = document.getElementById('gameArea');
var graph = gameCanvas.getContext('2d');
var miniMap = document.getElementById("minimap");
var miniMapFrame = miniMap.getContext("2d");


/**
 *
 */
var updateLifeBar = function () {
    var lifeBar = document.getElementById('lifeBar');

    if (screenWidth >= 320 && screenWidth <= 767) {
        lifeBar.style.height = (player.life * 150 / 100) + 'px';
        lifeBar.style.width = '5px';
    }
    if (screenWidth >= 768) {
        lifeBar.style.width = (player.life * 500 / 100) + 'px';
        lifeBar.style.height = '5px';
    }

    document.getElementById('lifePoint').innerHTML = player.life;

};

/**
 *
 */
var updateMunitionBar = function () {
    var munitionBar = document.getElementById('munitionBar');

    if (screenWidth >= 320 && screenWidth <= 767) {
        munitionBar.style.height = (player.munitions * 150 / 100) + 'px';
        munitionBar.style.width = '5px'
    }
    if (screenWidth >= 768) {
        munitionBar.style.width = (player.munitions * 500 / 100) + 'px';
        munitionBar.style.height = '5px';
    }

    document.getElementById('munitionPoint').innerHTML = player.munitions;

};

var updateLife = function () {
    updateLifeBar();
};

var updateMunition = function () {
    updateMunitionBar();
};

var updatePoints = function () {
    updateLifeBar();
    updateMunitionBar();
};