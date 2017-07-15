/*
 * Author(s)  : Chen Song
 * Description: This file defines the model of a privilege (user group).
 * Last Update: July 14, 2017
*/

module.exports = function(db, models) {
    models.UserGroup = db.define('privileges', {
        id: Number,          // e.g. 1, 2, 3
        description: String, // e.g. e.g. student, admin, faculty
        allowAdmin: Boolean, // e.g. true, false
        maxBookings: Number  // e.g. 0, 1, 2
    });
};