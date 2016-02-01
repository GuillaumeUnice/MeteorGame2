/**
 * Created by achabert on 15/01/2016.
 */

var util = require('./lib/util');

/*....................called in function balanceMass....................................;;;;;;;.........*/

exports.addFood = function (toAdd, configuration, food) {
    var radius = util.massToRadius(configuration.foodMass);
    while (toAdd--) {
        var position = configuration.foodUniformDisposition ? util.uniformPosition(food, radius) : util.randomPosition(radius);
        food.push({
            // Make IDs unique.
            id: ((new Date()).getTime() + '' + food.length) >>> 0,
            x: position.x,
            y: position.y
        });
    }
};

/*....................called in function balanceMass......................................................*/
exports.addVirus = function (toAdd, configuration, virus) {
    while (toAdd--) {
        var mass = util.randomInRange(configuration.virus.defaultMass.from, configuration.virus.defaultMass.to, true);
        var radius = util.massToRadius(mass);
        var position = configuration.virusUniformDisposition ? util.uniformPosition(virus, radius) : util.randomPosition(radius);
        virus.push({
            id: ((new Date()).getTime() + '' + virus.length) >>> 0,
            x: position.x,
            y: position.y
        });
    }
};

/*....................called in function balanceMass......................................................*/
exports.removeFood = function (toRemove, food) {
    while (toRemove--) {
        food.pop();
    }
};


