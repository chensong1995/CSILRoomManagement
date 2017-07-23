/*
 * Author(s)  : Chen Song
 * Description: This file implements an API that allows users to send heartbeat messages to our server. This allows us to tell if a machine is currently being used.
 * Last Update: July 22, 2017
*/

/*
 * Instructions for people who want to call this API:
 * 1. Please send a POST request to http://<our_url>/live
 * 2. Please use utf8 encoding
 * 3. Please make the request body as a JSON object, with:
 *    a) room, e.g. "ASB9700", "ASB9804"
 *    b) name, e.g. "a01", "a02"
 *    c) time, an unix timestamp. E.g. 1499469022
 * 4. You will receive a 200 response if everything works well
*/

// Test: 
// curl -d "room=ASB9700&name=a01&time=1499469022" -X POST -v http://localhost:3000/live


////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. node-orm2
var orm = require('orm');
////////////////////////////////////////////////////////

// Author(s)  : Chen Song
// Description: This function checks whether the user is sending us something valid
// Last Update: July 7, 2017
function isRequestVaild(req) {
    if (req.body.room && req.body.name && req.body.time) {
        return true; // must have these three fields
    } else {
        return false;
    }
}

// Author(s)  : Chen Song
// Description: This function handles heartbeat messages received from users
// Last Update: July 22, 2017
router.post('/', function(req, res) {
    if (isRequestVaild(req)) {
        req.models.Machine.find({name: req.body.name, room: req.body.room}, function (err, machines) {
            if (err || machines.length > 1) { // error occurs, or more than 1 such machines are found
                res.sendStatus(500); // internal server error
            } else if (machines.length == 0) {
                res.sendStatus(403); // the machine does not exist in our database
            } else {
                machine = machines[0];
                machine.heartbeat = new Date(parseInt(req.body.time) * 1000).toLocaleString(undefined, {timeZone: 'America/Vancouver'}); // update heartbeat
                // We do NOT change the machine availability here. 
                // It is managed by a SQL event that is executed every 30 seconds.
                machine.save(function(err) {
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else {
                        res.status(200).end(); // success
                    }
                });
            }
        });
    } else {
        res.sendStatus(403);
    }
});

module.exports = router;