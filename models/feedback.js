/*
 * Author(s)  : Ruiming Jia
 * Description: This file defines the model of user feedback.
 * Last Update: July 23, 2017
*/

module.exports = function(db, models) {
    models.Feedback = db.define('feedback', {
        id: String,                  // e.g. 1, 2, 3
        username: String,    // e.g. csa102, admin	
        message: String    // messages
    });
};