
// Function called when a key is pressed, will change direction if arrow key.
function directionDown(event) {
    console.log(event);
    var key = event.which || event.keyCode;

    if (directional(key)) {
        directionLock = true;
        if (newDirection(key,directions, true)) {
            updateTarget(directions);
            socket.emit('0', target);
        }
    }
}

// Function called when a key is lifted, will change direction if arrow key.
function directionUp(event) {
    var key = event.which || event.keyCode;
    if (directional(key)) {
        if (newDirection(key,directions, false)) {
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