/*
 * Author(s)  : Chen Song
 * Description: This collects all models we have, and turn them into an orm call.
 * Last Update: July 15, 2017
*/

var orm = require('orm');

// All models we have
var machine = require('./machine.js');
var userDisplay = require('./user-display.js');
var user = require('./user.js');
var userGroup = require('./user-group.js');
var room = require('./room.js');
var bookingRecord = require('./booking-record.js');
var privilege = require('./privilege.js');
var announcement = require('./announcement.js');
var calendarKey = require('./ical-key.js');
var feedback = require('./feedback.js');

//const connectionString = 'mysql://csil:csil@120.27.121.163/csil';
const connectionString = 'mysql://root:password@13.59.137.163/csil';

module.exports = function (app) {
    app.use(orm.express(connectionString, {
        define: function (db, models, next) {
            machine(db, models);
            userDisplay(db, models);
            user(db, models);
            userGroup(db, models);
            room(db, models);
            bookingRecord(db, models);
            privilege(db, models);
            announcement(db, models);
            calendarKey(db, models);
            feedback(db, models);
            next();
        }
    }));
}