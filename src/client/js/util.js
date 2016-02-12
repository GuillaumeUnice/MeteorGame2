/**
 * @author Falou & Guillaume
 */

/***********
 *#################
 *  Variables
 *  ###############
 */
var KEY_ENTER = 13, KEY_FIREFOOD = 32, KEY_LEFT = 37, KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40;

var MIN_SM_WIDTH = 320, MAX_SM_WIDTH = 767, MIN_MD_WIDTH = 768, MAX_MD_WIDTH = 1024, PROJECTOR_WIDTH = 1024;

var MAX_ASSET = 100, BAR_WIDTH = 500, BAR_HEIGHT = 150;

var socket, playerName, playerType;

var playerNameInput = document.getElementById('playerNameInput'), askingPlayer = false, connectedToOthers = false;

var reSend = true, borderDraw = true, animLoopHandle;

var screenWidth = window.innerWidth, screenHeight = window.innerHeight;

var gameWidth = 0, gameHeight = 0;

var xoffset = -gameWidth, yoffset = -gameHeight;

var gameStart = false, disconnected = false, died = false, kicked = false;

var continuity = false, backgroundColor = '#010117', lineColor = '#000000', borderColor = '#FFFFFF';

/**
 * When a player asks for regrouping, this represents the possible lead when the current player accepts
 * @type {undefined}
 */
var possibleAlly = undefined, player = {
    id: -1,
    x: screenWidth / 2,
    y: screenHeight / 2,
    screenWidth: screenWidth,
    screenHeight: screenHeight,
    target: {x: screenWidth / 2, y: screenHeight / 2}
};

var assets = [], bombs = [], bulletsToDraw = [], users = [], connectedPlayers = [];
var target = {x: player.x, y: player.y}, directionLock = true, directions = [];

var gameCanvas = document.getElementById('gameArea'), miniMap = document.getElementById("minimap");

var graph = gameCanvas.getContext('2d'), miniMapFrame = miniMap.getContext("2d");

/**
 *#############
 * Functions
 * ############
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
    //this.intro = new Audio('../sounds/intro.mp3');
};

/**
 *  @author Falou
 * @type {imageRepository}
 */
var imageRepository = new function () {
    this.playerImg = new Image();
    this.otherPlayerImg = new Image();
    this.bulletImg = new Image();
    this.starImg = new Image();
    this.bombImg = new Image();
    this.objectImg = new Image();

    this.player_up = "../img/ship_up.png";
    this.player_down = "../img/ship_down.png";
    this.player_left = "../img/ship_left.png";
    this.player_right = "../img/ship_right.png";

    this.playerImg.src = this.player_up;
    this.otherPlayerImg.src = this.player_up;
    this.bulletImg.src = "../img/bullet.png";
    this.starImg.src = "../img/star.png";
    this.bombImg.src = "../img/bomb.png";
    this.circle = {};
};

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
    return screenWidth >= PROJECTOR_WIDTH;
};

var printMessage = function (message) {
    graph.fillStyle = '#333333';
    graph.fillRect(0, 0, screenWidth, screenHeight);
    graph.textAlign = 'center';
    graph.fillStyle = '#FFFFFF';
    graph.font = 'bold 30px sans-serif';
    graph.fillText(message, screenWidth / 2, screenHeight / 2);
};

var vibrate = function () {
    if (onSmartphone() || onTablet())
        window.navigator.vibrate(200);
};