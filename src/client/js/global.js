var KEY_ESC = 27;
var KEY_ENTER = 13;
var KEY_CHAT = 13;
//var KEY_FIREFOOD = 119;
var KEY_FIREFOOD = 32;
//var KEY_SPLIT = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var KEY_FIRE = 32;

var playerName;
var playerType;
var playerNameInput = document.getElementById('playerNameInput');
var socket;

var reason;
var reenviar = true;
var borderDraw = false;
var animLoopHandle;
var spin = -Math.PI;
var enemySpin = -Math.PI;
var mobile = false;
var foodSides = 10;
var virusSides = 20;
