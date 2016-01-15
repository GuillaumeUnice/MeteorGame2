var io = require('socket.io-client');

if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
	mobile = true;
}

function startGame(type) {
	playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '').substring(0,25);
	playerType = type;

	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;

	document.getElementById('startMenuWrapper').style.maxHeight = '0px';
	document.getElementById('gameAreaWrapper').style.opacity = 1;
	if (!socket) {
		socket = io({query:"type=" + type});
		setupSocket(socket);
	}
	if (!animLoopHandle)
		animloop();
	socket.emit('respawn');
}

// Checks if the nick chosen contains valid alphanumeric characters (and underscores).
function validNick() {
	var regex = /^\w*$/;
	console.log('Regex Test', regex.exec(playerNameInput.value));
	return regex.exec(playerNameInput.value) !== null;
}

window.onload = function() {

	var btn = document.getElementById('startButton'),
		btnS = document.getElementById('spectateButton'),
		nickErrorText = document.querySelector('#startMenu .input-error');

	btnS.onclick = function () {
		startGame('spectate');
	};
	btn.onclick = function () {

		// Checks if the nick is valid.
		if (validNick()) {
			nickErrorText.style.opacity = 0;
			startGame('player');
		} else {
			nickErrorText.style.opacity = 1;
		}
	};

	var settingsMenu = document.getElementById('settingsButton');
	var settings = document.getElementById('settings');
	var instructions = document.getElementById('instructions');

	settingsMenu.onclick = function () {
		if (settings.style.maxHeight == '300px') {
			settings.style.maxHeight = '0px';
		} else {
			settings.style.maxHeight = '300px';
		}
	};

	playerNameInput.addEventListener('keypress', function (e) {
		var key = e.which || e.keyCode;

		if (key === KEY_ENTER) {
			if (validNick()) {
				nickErrorText.style.opacity = 0;
				startGame('player');
			} else {
				nickErrorText.style.opacity = 1;
			}
		}
	});
};






$( "#feed" ).click(function() {
	socket.emit('1');
	reenviar = false;
});

$( "#split" ).click(function() {
	socket.emit('2');
	reenviar = false;
});

/*
 // Updates the target according to the directions in the directions array.
 function updateTarget(list) {
 target = { x : 0, y: 0 };
 var directionHorizontal = 0;
 var directionVertical = 0;
 for (var i = 0, len = list.length; i < len; i++) {
 if (directionHorizontal === 0) {
 if (list[i] == KEY_LEFT) directionHorizontal -= Number.MAX_VALUE;
 else if (list[i] == KEY_RIGHT) directionHorizontal += Number.MAX_VALUE;
 }
 if (directionVertical === 0) {
 if (list[i] == KEY_UP) directionVertical -= Number.MAX_VALUE;
 else if (list[i] == KEY_DOWN) directionVertical += Number.MAX_VALUE;
 }
 }
 target.x += directionHorizontal;
 target.y += directionVertical;
 }*/

function directional(key) {
	return horizontal(key) || vertical(key);
}

function horizontal(key) {
	return key == KEY_LEFT || key == KEY_RIGHT;
}

function vertical(key) {
	return key == KEY_DOWN || key == KEY_UP;
}
function checkLatency() {
	// Ping.
	startPingTime = Date.now();
	socket.emit('ping');
}
