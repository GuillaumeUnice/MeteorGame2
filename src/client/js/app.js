var io = require('socket.io-client');

/**
 * This will be removed. We will use bootstrap and media queries to resolve mobile issues
 */

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    mobile = true;
}

function startGame(type) {

    document.getElementById('vaisseau').style.visibility = 'visible';
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '').substring(0, 25);
    playerType = type;
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    /**
     * When the game starts, the start menu disappears
     * @type {string}
     */
    document.getElementById('startMenuWrapper').style.maxHeight = '0px';
    document.getElementById('gameAreaWrapper').style.opacity = 1;
    if (!socket) {
        socket = io({query: "type=" + type});
        setupSocket(socket);
    }
    if (!animLoopHandle)
        animloop();
    socket.emit('respawn');
}

// Checks if the nick chosen contains valid alphanumeric characters (and underscores).
function validNick() {
    var regex = /^\w*$/;
    return regex.exec(playerNameInput.value) !== null;
}

window.onload = function () {
    var vaisseau = document.getElementById('vaisseau');

    vaisseau.style.visibility = 'hidden';
    var btn = document.getElementById('startButton');

    var nickErrorText = document.querySelector('#startMenu .input-error');

    btn.onclick = function () {

        // Checks if the nick is valid.
        if (validNick()) {
            nickErrorText.style.opacity = 0;
            startGame('player');

        } else {
            nickErrorText.style.opacity = 1;
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


/**
 * We will use this as gunshots
 */
$("#feed").click(function () {
    socket.emit('1');
    reenviar = false;
});

$("#split").click(function () {
    socket.emit('2');
    reenviar = false;
});

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
