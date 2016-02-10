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
        var objectToAdd = {
            // Make IDs unique.
            id: ((new Date()).getTime() + '' + object.length) >>> 0,
            x: position.x,
            y: position.y,
            radius: configuration.object.objectRadius
        };
        if (random === 1) {
            objectToAdd.type = configuration.object.mineType.name;
            objectToAdd.imageUrl = 'img/_bomb.png';
        } else if (random === 2) {
            objectToAdd.type = configuration.object.bulletType.name;
            objectToAdd.imageUrl = 'img/munition.png';
        } else {
            objectToAdd.type = configuration.object.lifeType.name;
            objectToAdd.imageUrl = 'img/life.png'
        }
        object.push(objectToAdd);

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
