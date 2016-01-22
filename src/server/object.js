'use strict';
var util = require('./lib/util');


/**
    Fonction permettant d'ajouter un objet : position, taille et couleur
**/
exports.addObject = function (toAdd, c, object) {
    var radius = c.object.objectRadius;
    while (toAdd--) {
        var position = c.foodUniformDisposition ? util.uniformPosition(object, radius) : util.randomPosition(radius);
        object.push({
            // Make IDs unique.
            id: ((new Date()).getTime() + '' + object.length) >>> 0,
            x: position.x,
            y: position.y,
            radius: c.object.objectRadius,
            hue: c.object.fill,
            fill: c.object.fill,
            stroke: c.object.stroke,
            strokeWidth: c.object.strokeWidth
        });
    }

}


/**
    Fonction s'occupant de la generation d'objet en fonction des objets restant
    fait un ratio entre objet max et objet restant.
**/
/*exports.balanceObject = function () {

    var objectToAdd = object.length - c.objectMax;

    if (foodToAdd > 0) {
        addObject(objectToAdd);
    }
}*/

/** Simple suppression d'objet **/
exports.removeObject = function(toRem) {
    while (toRem--) {
        Object.pop();
    }
}
/** Test de collision **/
exports.funcObject = function (f) {
    return SAT.pointInCircle(new V(f.x, f.y), playerCircle);
}
/** Suppression d'objet **/
exports.deleteObject = function (f) {
    object[f] = {};
    object.splice(f, 1);
}
