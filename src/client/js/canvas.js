/**
 *
 * @type {Number}
 */
// Canvas.
var screenWidth = window.innerWidth;

var screenHeight = window.innerHeight;
var gameWidth = 0;
var gameHeight = 0;
var xoffset = -gameWidth;
var yoffset = -gameHeight;

var gameStart = false;
var disconnected = false;
var died = false;
var kicked = false;

// TODO: Break out into GameControls.
var continuity = false;
var startPingTime = 0;
var toggleMassState = 0;
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

var foods = [];
var viruses = [];
var fireFood = [];
var users = [];
var leaderboard = [];
var target = {x: player.x, y: player.y};
var reenviar = true;
var directionLock = false;
var directions = [];

var c = document.getElementById('cvs');
c.width = screenWidth; c.height = screenHeight;
c.addEventListener('mousemove', gameInput, false);
c.addEventListener('mouseout', outOfBounds, false);
c.addEventListener('keyup', function(event) {reenviar = true; directionUp(event);}, false);
c.addEventListener('keydown', directionDown, false);
c.addEventListener('touchstart', touchInput, false);
c.addEventListener('touchmove', touchInput, false);

// Register when the mouse goes off the canvas.
function outOfBounds() {
    if (!continuity) {
        target = { x : 0, y: 0 };
    }
}

var graph = c.getContext('2d');

function gameInput(mouse) {
    if (!directionLock) {

        target.x = mouse.clientX - screenWidth / 2;
        target.y = mouse.clientY - screenHeight / 2;
        //TODO : ne pas supprimer
        //console.log(target);
    }
}

function touchInput(touch) {
    touch.preventDefault();
    touch.stopPropagation();
    if (!directionLock) {
        target.x = touch.touches[0].clientX - screenWidth / 2;
        target.y = touch.touches[0].clientY - screenHeight / 2;
    }
}