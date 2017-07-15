/*
 * Author(s)  : Chong
 * Description: This file defines the model of a room.
 * Last Update: July 7, 2017
*/

module.exports = function(db, models) {
    models.Room = db.define('rooms', {
        id: String,         // e.g. 1, 2, 3
        number: String,       // e.g. a01, a02, a03
        status: String,       // e.g. ASB9700, ASB9804
    });
};