/*
 * Author(s)  : Ruiming Jia
 * Description: This file defines the model of user feedback.
 * Last Update: July 23, 2017
*/

module.exports = function(db, models) {
    models.Feedback = db.define('feedback', {
        id: String,             // e.g. 1, 2, 3
        uid: String,			// user ID
        username: String,    	// e.g. csa102, admin	
        message: String,    	// messages
        sendByAdmin: Number,	//0: send by user, 1: send by admin
        preMessage: String,		//previous message that is being replied
        time: Date,
        replied: Number			//0: not replied yet, 1: replied
    });
};