/**
 * This file essentially deals with the game's setup on startup
 * @type {lookup|exports|module.exports}
 */

var io = require('socket.io-client');

/**
 * Called when all the settings are checked
 * @param type
 */
function startGame(type) {
    playerName = playerNameInput.value.replace(/(<([^>]+)>)/ig, '').substring(0, 25);
    playerType = type;
    gameCanvas.width = screenWidth = window.innerWidth;
    gameCanvas.height = screenHeight = window.innerHeight;
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
        animationLoop();
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

    // soundRepository.intro.play();

    var btn = document.getElementById('startButton');

    var nickErrorText = document.querySelector('#startMenu .input-error');

    var setupGame = function () {
        // Checks if the nick is valid.
        if (validNick()) {
            nickErrorText.style.opacity = 0;
            startGame('player');
            //  soundRepository.intro.pause();

        } else {
            nickErrorText.style.opacity = 1;
        }
    };

    btn.onclick = function () {
        setupGame();
    };

    playerNameInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;
        if (key === KEY_ENTER) {
            setupGame();
        }
    });
};

/**
 * We will use this as gunshots
 */
var refreshIntervalId = null;
/*$('#fire').on("mousedown", function () {
 refreshIntervalId = setInterval(function () {
 console.log('Player');
 console.log(player);
 socket.emit('1', player);
 }, 500);
 reSend = false;
 });

 $('#fire').on("mouseup", function () {
 clearInterval(refreshIntervalId);
 });*/

$("#fire").click(function () {
    socket.emit('1', player);
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

    socket.emit('acceptJoin', possibleAlly);
    connectedToOthers = true;

    regroup.css('visibility', 'visible');
    regroup.css('color', '#00FF00');
    regroup.css('cursor', 'none');
    regroup.removeClass('fa-spinner fa-spin');
    regroup.addClass('fa-users');

    $('#joinDiv').css("visibility", "hidden");
});

$("#rejectJoin").click(function () {
    $('#regroup').css('visibility', 'visible');
    $('#joinDiv').css("visibility", "hidden");
});
