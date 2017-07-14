/*
 * Author(s)  : Chen Song, Ruiming Jia
 * Description: This file defines the model of an user.
 * Last Update: July 13, 2017
*/

module.exports = function(db, models) {
    models.User = db.define('users', {
        id: String,          // e.g. 1, 2, 3
        username: String,    // e.g. csa102, admin
        password: String,    // e.g. bcrypt("admin")
        type: String,        // e.g. sfu, other
        privilege: Number,   // e.g. 1, 2, 3 (please refer to the 'privileges' table)
        sid: Number,         // Session id
        email: String,		 // user email
        notification: Number,// 1: require notification, 0: no notification		
        biography: String,   // user biography
    });
};