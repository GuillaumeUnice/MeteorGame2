'use strict';
var util = require('./lib/util');


/**
    Fonction permettant d'ajouter un objet : position, taille et couleur
**/
exports.addObject = function (toAdd, c, object) {
    var radius = c.object.objectRadius;
    while (toAdd--) {

        var position = c.foodUniformDisposition ? util.uniformPosition(object, radius) : util.randomPosition(radius);
        var random = Math.floor(Math.random() * 3) + 1;
        if(random === 1) {
            object.push({
                // Make IDs unique.
                id: ((new Date()).getTime() + '' + object.length) >>> 0,
                x: position.x,
                y: position.y,
                radius: c.object.objectRadius,
                hue: c.object.mineType.fill,
                fill: c.object.mineType.fill,
                stroke: c.object.mineType.stroke,
                strokeWidth: c.object.strokeWidth,
                type: c.object.mineType.name
            });
        } else if(random === 2) {
            object.push({
                // Make IDs unique.
                id: ((new Date()).getTime() + '' + object.length) >>> 0,
                x: position.x,
                y: position.y,
                radius: c.object.objectRadius,
                hue: c.object.bulletType.fill,
                fill: c.object.bulletType.fill,
                stroke: c.object.bulletType.stroke,
                strokeWidth: c.object.strokeWidth,
                type: c.object.bulletType.name
            });
        } else {
            object.push({
                // Make IDs unique.
                id: ((new Date()).getTime() + '' + object.length) >>> 0,
                x: position.x,
                y: position.y,
                radius: c.object.objectRadius,
                hue: c.object.lifeType.fill,
                fill: c.object.lifeType.fill,
                stroke: c.object.lifeType.stroke,
                strokeWidth: c.object.strokeWidth,
                type: c.object.lifeType.name
            });
        }
        
    }

};


/**
    Fonction s'occupant de la generation d'objet en fonction des objets restant
    fait un ratio entre objet max et objet restant.
**/
/*exports.balanceObject = function () {

    var objectToAdd = object.length - gameSettings.objectMax;

    if (foodToAdd > 0) {
        addObject(objectToAdd);
    }
}*/

/** Simple suppression d'objet **/
exports.removeObject = function(toRem) {
    while (toRem--) {
        Object.pop();
    }
};
/** Test de collision **/
exports.funcObject = function (f) {
    return SAT.pointInCircle(new SATVector(f.x, f.y), playerCircle);
};
/** Suppression d'objet **/
exports.deleteObject = function (f) {
    object[f] = {};
    object.splice(f, 1);
};
