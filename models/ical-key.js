/*
 * Author(s)  : Chong
 * Description: This file defines the model of a room.
 * Last Update: July 7, 2017
*/

module.exports = function(db, models) {
    models.CalendarKey = db.define('calendar-key', {
        id: String,           // e.g. 1, 2, 3 , the id of this record
        uid: String,          // e.g. 1, 2, 3 , the id of user
        ckey: String,         // Calendar key used in ical feed
    });
};