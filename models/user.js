/*
 * Author(s)  : Chen Song
 * Description: This file defines the model of an user.
 * Last Update: July 7, 2017
*/

module.exports = function(db, models) {
    models.User = db.define('users', {
        id: String,          // e.g. 1, 2, 3
        username: String,    // e.g. csa102, admin
        password: String,    // e.g. bcrypt("admin")
        type: String,        // e.g. sfu, other
        allowAdmin: Boolean, // e.g. true, false
        maxBookings: Number, // e.g. 0, 1, 2
        sid: String          // Session id
    });
};