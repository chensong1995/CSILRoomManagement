/*
 * Author(s)  : Chen Song
 * Description: This file defines the model of a machine.
 * Last Update: July 7, 2017
*/

module.exports = function(db, models) {
    models.Machine = db.define('machines_display', {
        id: String,         // e.g. 1, 2, 3
        name: String,       // e.g. a01, a02, a03
        room: String,       // e.g. ASB9700, ASB9804
        available: Boolean, // e.g. true, false
        heartbeat: Date     // Unix timestamp
    });
};