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
    if (!animLoopHandle) {
        animloop();
    }

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

$("#regroup").click(function () {
    var regroupImg = $('#regroup');
    if (!connectedToOthers) {
        socket.emit('regroupPlayers');
        regroupImg.removeClass('fa-users');
        regroupImg.addClass("fa-spinner fa-spin");
        askingPlayer = true;
    }
});


$("#acceptJoin").click(function () {
    var regroup = $('#regroup');
    socket.emit('acceptJoin', player);
    connectedToOthers = true;
    regroup.css('visibility', 'visible');
    regroup.css('color', '#00FF00');
    regroup.css('cursor', 'none');
    regroup.removeClass('fa-spinner fa-spin');
    regroup.addClass('fa-users');
    $('#joinDiv').css("visibility", "hidden");
});

$("#rejectJoin").click(function () {
    socket.emit('rejectJoin');
    $('#regroup').css('visibility', 'visible');
    $('#joinDiv').css("visibility", "hidden");
});

function checkLatency() {
    // Ping.
    startPingTime = Date.now();
    socket.emit('ping');
}
