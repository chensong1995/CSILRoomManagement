/*
 * Author(s)  : Chong
 * Description: This file handles room status check and room booking service
 * Last Update: July 14, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. csurf protection
var csurf = require('csurf'); 
var csrfProtection = csurf({ cookie: true });
////////////////////////////////////////////////////////

router.use(csrfProtection);

// Author(s)  : Chong
// Description: This function directs user to room booking page
// Last Update: July 14, 2017
router.get('/', function(req, res) {
    var username = req.userDisplay.username;
    var userSource = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    req.models.Room.all(function (err, rooms) {
        if (err || rooms.length < 1) { // if error occurs or no room is found
            res.status(500).end(); // internal server error
        }else{
            var room_status_list = [];
            rooms.forEach(function(room) {
                var obj = new Object();
                obj.room_id = room.id;
                obj.number  = room.number;
                obj.status = room.status;
                room_status_list.push(obj)
            })
            res.render('room_overview', { 
                username: username,
                source: userSource,
                allowAdmin: req.userDisplay.allowAdmin, 
                page: "Booking",
                room_status_list: room_status_list
            });
        }
    });
});

// Author(s)  : Chong
// Description: This function directs user to a calendar of a specific room
// parameter  : /:room_id the id of the room
// Last Update: July 14, 2017
router.get('/:room_id', function(req, res) {
    var username = req.userDisplay.username;
    var userSource = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    req.models.Room.find({id: req.params.room_id}, function (err, room) {
        if (err || room.length < 1) { // if error occurs or no room is found
            res.status(500).end(); // internal server error
        }else{
            res.render('room_status_calendar', { 
                username: username, 
                source: userSource,
                allowAdmin: req.userDisplay.allowAdmin, 
                page: "Booking",
                room_name: room[0].number,
                room_id: room[0].id
            });
        }
    });
});

// Author(s)  : Chong
// Description: This function talks to full calendar, returns the events json string for specific room
// parameter  : /:room_id the id of the room
// Last Update: July 14, 2017
router.get('/events/:room_id', function(req, res) {
    var username = req.userDisplay.username;
    req.models.Room.find({id: req.params.room_id}, function (err, room) {
        if (err || room.length < 1) { // if error occurs or no room is found
            res.status(500).end(); // internal server error
        }else{
            var room_id = room[0].id;
            var start = req.query.start;
            var end = req.query.end;
            req.models.BookingRecord.find({rid: room_id},function (err, records) {
                if (err || room.length < 1) { // if error occurs or no room is found
                    res.status(500).end(); // internal server error
                }else{
                    var record_list = [];
                    records.forEach(function(record) {
                        if( Date.parse ( start ) <= Date.parse ( record.start )
                            && Date.parse ( end ) >= Date.parse ( record.end ) ){
                            var record_obj = new Object();
                            record_obj.title = record.title
                            record_obj.start = record.start
                            record_obj.end = record.end
                            record_list.push(record_obj)
                        }
                    });
                    res.send(JSON.stringify(record_list));
                }
            });
        }
    });
});

// Author(s)  : Chong
// Description: This function handles the room booking request
// Last Update: July 14, 2017
router.post('/', function(req, res) {
    var username = req.userDisplay.username;
    
});

module.exports = router;