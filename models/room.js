/*
 * Author(s)  : Chong, Chen Song
 * Description: This file defines the model of a room.
 * Last Update: July 15, 2017
*/

module.exports = function(db, models) {
    models.Room = db.define('rooms', {
        id: String,                  // e.g. 1, 2, 3
        number: String,              // e.g. a01, a02, a03
        isBeingMaintained: Boolean,   // e.g. true, false
        coordinate_x: Number,
        coordinate_y: Number,
        width: Number,
        height: Number,
    });
};