/************
 *
 * Command keys
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
var borderDraw = false;
var animLoopHandle;
var spin = -Math.PI;
var mobile = false;
var foodSides = 10;

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
var backgroundColor = '#ffffff';

var lineColor = '#000000';

var foodConfig = {
    border: 0
};

var playerConfig = {
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
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