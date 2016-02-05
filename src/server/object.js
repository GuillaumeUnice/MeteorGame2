'use strict';
var util = require('./lib/util');


/**
 Fonction permettant d'ajouter un objet : position, taille et couleur
 **/
exports.addObject = function (toAdd, configuration, object) {
    var radius = configuration.object.objectRadius;
    while (toAdd--) {

        var position = configuration.foodUniformDisposition ? util.uniformPosition(object, radius) : util.randomPosition(radius);
        var random = Math.floor(Math.random() * 3) + 1;
        if (random === 1) {
            object.push({
                // Make IDs unique.
                id: ((new Date()).getTime() + '' + object.length) >>> 0,
                x: position.x,
                y: position.y,
                radius: configuration.object.objectRadius,
                hue: configuration.object.mineType.fill,
                fill: configuration.object.mineType.fill,
                stroke: configuration.object.mineType.stroke,
                strokeWidth: configuration.object.strokeWidth,
                type: configuration.object.mineType.name,
                imageUrl: 'img/_bomb.png'
            });
        } else if (random === 2) {
            object.push({
                // Make IDs unique.
                id: ((new Date()).getTime() + '' + object.length) >>> 0,
                x: position.x,
                y: position.y,
                radius: configuration.object.objectRadius,
                hue: configuration.object.bulletType.fill,
                fill: configuration.object.bulletType.fill,
                stroke: configuration.object.bulletType.stroke,
                strokeWidth: configuration.object.strokeWidth,
                type: configuration.object.bulletType.name,
                imageUrl: 'img/munition.png'
            });
        } else {
            object.push({
                // Make IDs unique.
                id: ((new Date()).getTime() + '' + object.length) >>> 0,
                x: position.x,
                y: position.y,
                radius: configuration.object.objectRadius,
                hue: configuration.object.lifeType.fill,
                fill: configuration.object.lifeType.fill,
                stroke: configuration.object.lifeType.stroke,
                strokeWidth: configuration.object.strokeWidth,
                type: configuration.object.lifeType.name,
                imageUrl: 'img/life.png'
            });
        }

    }

};


/**
 Fonction s'occupant de la generation d'objet en fonction des objets restant
 fait un ratio entre objet max et objet restant.
 **/

/** Simple suppression d'objet **/
exports.removeObject = function (toRemove) {
    while (toRemove--) {
        Object.pop();
    }
};
/** Test de collision **/
exports.funcObject = function (object) {
    return SAT.pointInCircle(new SATVector(object.x, object.y), playerCircle);
};
/** Suppression d'objet **/
exports.deleteObject = function (object) {
    object[object] = {};
    object.splice(object, 1);
};
