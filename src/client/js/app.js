var io = require('socket.io-client');

/**
 * This will be removed. We will use bootstrap and media queries to resolve mobile issues
 */
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
    mobile = true;
}

/**
 * Called when all the settings are checked
 * @param type
 */
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

/**
 * When we access the window
 */
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

/**
 * Previously used to split in 2 the circle
 */
$("#split").click(function () {
    socket.emit('2');
    reenviar = false;
});

// Function called when a key is pressed, will change direction if arrow key.
function directionDown(event) {
    var key = event.which || event.keyCode;

    if (directional(key)) {
        directionLock = true;
        if (newDirection(key, directions, true)) {
            updateTarget(directions);
            socket.emit('0', target);
        }
    }
}
// Function called when a key is lifted, will change direction if arrow key.
function directionUp(event) {
    var key = event.which || event.keyCode;
    if (directional(key)) {
        if (newDirection(key, directions, false)) {
            updateTarget(directions);
            if (directions.length === 0) directionLock = false;
            socket.emit('0', target);
        }
    }
}

// Updates the direction array including information about the new direction.
function newDirection(direction, list, isAddition) {
    var result = false;
    var found = false;
    for (var i = 0, len = list.length; i < len; i++) {
        if (list[i] == direction) {
            found = true;
            if (!isAddition) {
                result = true;
                // Removes the direction.
                list.splice(i, 1);
            }
            break;
        }
    }
    // Adds the direction.
    if (isAddition && found === false) {
        result = true;
        list.push(direction);
    }

    return result;
}

// Updates the target according to the directions in the directions array.
function updateTarget(list) {
    target = {x: 0, y: 0};
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
}


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
