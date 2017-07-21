/*
 * Author(s)  : Chong
 * Description: This file defines the model of a room.
 * Last Update: July 7, 2017
*/

module.exports = function(db, models) {
    models.BookingRecord = db.define('booking', {
        id: String,           // e.g. 1, 2, 3 , the id of this record
        rid: String,          // e.g. 1, 2, 3 , the id of room
        uid: String,          // e.g. 1, 2, 3 , the id of user
        start: String,		  // e.g. 2017-05-09T16:00:00-05:00, timestamp of the beginning of the booking
        end: String,          // e.g. 2017-05-09T16:00:00-05:00, timestamp of the end of the booking
        title: String,        // e.g. CMPT 470 Office Hour, title of the booking
        name: String,         // e.g. ASB9400
        isBatch: Boolean,     // e.g. true or false
        dow: String,          // e.g. [1, 4, 7] means every Mon., Thu. and Sun. 
        rangeStart: String,   // e.g. 2017-05-09
        rangeEnd: String      // e.g. 2017-07-09
    });
};