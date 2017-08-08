/*
 * Author(s)  : Chen Song
 * Description: This file defines the model of an announcement.
 * Last Update: July 15, 2017
*/

module.exports = function(db, models) {
    models.Announcement = db.define('announcements', {
        id: String,         // e.g. 1, 2, 3
        title: String,      // e.g. 'Computing Science Instructional Labs Policies'
        content: String,    // in HTML
        time: Date,         // Unix timestamp
        slug: String
    });
};