/*
 * Author(s)  : Chen Song
 * Description: This file defines the model of an user display.
 * Last Update: July 8, 2017
*/

module.exports = function(db, models) {
    models.UserDisplay = db.define('users_display', {
        id: String,          // e.g. 1, 2, 3
        username: String,    // e.g. csa102, admin
        password: String,    // e.g. bcrypt("admin")
        type: String,        // e.g. sfu, other
        allowAdmin: Boolean, // e.g. true, false
        maxBookings: Number, // e.g. 0, 1, 2
        sid: String          // Session id
    });
};