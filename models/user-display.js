/*
 * Author(s)  : Chen Song
 * Description: This file defines the model of an user display.
 * Last Update: July 14, 2017
*/

module.exports = function(db, models) {
    models.UserDisplay = db.define('users_display', {
        id: Number,          // e.g. 1, 2, 3
        username: String,    // e.g. csa102, admin
        password: String,    // e.g. bcrypt("admin")
        type: String,        // e.g. sfu, other
        usergroup: String,   // e.g. student, admin, faculty
        privilege: Number,   // e.g. 1, 2, 3 (please refer to the 'privileges' table)
        allowAdmin: Boolean, // e.g. true, false
        maxBookings: Number, // e.g. 0, 1, 2
        sid: String,         // Session id
        email: String,		 // user email
        notification: Number,// 1: require notification, 0: no notification		
        biography: String    // user biography
    });
};