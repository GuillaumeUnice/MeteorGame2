var object = [];

/**
    Fonction permettant d'ajouter un objet : position, taille et couleur
**/
function addObject(toAdd) {
    //var radius = c.util.massToRadius(c.foodMass);
    while (toAdd--) {
        var position = c.foodUniformDisposition ? util.uniformPosition(food, radius) : util.randomPosition(radius);
        object.push({
            // Make IDs unique.
            id: ((new Date()).getTime() + '' + object.length) >>> 0,
            x: position.x,
            y: position.y,
            radius: objectRadius,
            hue: c.objectColor
        });
    }
}


/**
    Fonction s'occupant de la generation d'objet en fonction des objets restant
    fait un ratio entre objet max et objet restant.
**/
function balanceObject() {

    var objectToAdd = object.length - c.objectMax;

    if (foodToAdd > 0) {
        addObject(objectToAdd);
    }
}

/** Simple suppression d'objet **/
function removeObject(toRem) {
    while (toRem--) {
        Object.pop();
    }
}

/** Test de collision **/
function funcObject(f) {
    return SAT.pointInCircle(new V(f.x, f.y), playerCircle);
}
/** Suppression d'objet **/
function deleteObject(f) {
    object[f] = {};
    object.splice(f, 1);
}