/**
 * Handles moves mainly via the keyboard
 * @param event
 */

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