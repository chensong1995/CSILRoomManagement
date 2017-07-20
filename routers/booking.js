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
                obj.room_id = room.number;
                obj.number  = room.number;
                obj.isBeingMaintained = room.isBeingMaintained;
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
// Description: This function directs user to booking management
// Last Update: July 14, 2017
router.get('/manage', function(req, res) {
    var username = req.userDisplay.username;
    var userSource = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    res.render('booking_manage', { 
        username: username,
        source: userSource,
        allowAdmin: req.userDisplay.allowAdmin, 
        page: "Booking",
        csrfToken: req.csrfToken(),
    });
});

// Author(s)  : Chong
// Description: This function generates the iCal feed url
// Last Update: July 14, 2017
router.post('/icalgenerate', function(req, res) {
    
});

// Author(s)  : Chong
// Description: This function directs user to a calendar of a specific room
// parameter  : /:room_id the id of the room
// Last Update: July 14, 2017
router.get('/:room_id', function(req, res) {
    var username = req.userDisplay.username;
    var userSource = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    req.models.Room.find({number: req.params.room_id}, function (err, room) {
        if (err || room.length < 1) { // if error occurs or no room is found
            res.status(500).end(); // internal server error
        }else{
            res.render('room_status_calendar', { 
                username: username, 
                source: userSource,
                allowAdmin: req.userDisplay.allowAdmin, 
                page: "Booking",
                room_name: room[0].number,
                room_id: room[0].number,
                room_in_maintenance: room[0].isBeingMaintained,
                csrfToken: req.csrfToken(),
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
    req.models.Room.find({number: req.params.room_id}, function (err, room) {
        if (err || room.length < 1) { // if error occurs or no room is found
            res.status(500).end(); // internal server error
        }else{
            var today = new Date();
            today.setHours(0,0,0,0);
            var room_id = room[0].id;
            var start = today;
            var end = req.query.end;
            req.models.BookingRecord.find({rid: room_id},function (err, records) {
                if (err) { // if error occurs or no room is found
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
    var start = req.body.start;
    var end = req.body.end;
    var title = req.body.title;
    var concurrent_booking_conflict = 0;
    var room_id = 0;
    // Using the room number to find the id in database table
    req.models.Room.find({number: req.body.room_id}, function (err, room) {
        if (err || room.length < 1) { // if error occurs or no room is found
            throw err;
            res.status(500).end(); // internal server error
        }else{
            room_id = room[0].id;
        }
    });
    req.models.UserDisplay.find({sid: req.cookies.sid}, function (err, users) { 
        if (err || users.length > 1) { // error occurs, or more than 1 such users are found
            res.status(500).end(); // internal server error
        } else {
            if(users[0].maxBookings <= 0){
                // The user is not allowed to book a room
                var result = new Object();
                result.result = "error";
                result.errMsg = "You are not allowed to book a room, please double-check or contact admin";
                res.send(JSON.stringify(result));
                res.status(403).end();
            }else{
                req.models.BookingRecord.all(function (err, records) {
                    if (err) { // if error occurs or no room is found
                        res.status(500).end(); // internal server error
                    }else{
                        var result = new Object();
                        records.forEach(function(record) {
                            // Check whether there is time conflict
                            if((Date.parse ( start ) < Date.parse ( record.start )
                                && Date.parse ( end ) > Date.parse ( record.start ))
                                || ( Date.parse ( start ) >= Date.parse ( record.start )
                                     && Date.parse ( start ) <= Date.parse ( record.end ))
                                || (Date.parse ( start ) >= Date.parse ( end ))){
                                if(record.rid == room_id){
                                    // If conflict happens in the same room, reject the booking request
                                    result.result = "error";
                                    result.errMsg = "There is time slot conflict, please refresh your page to get up-to-date calendar";
                                }else if(record.uid = users[0].id){
                                    // If conflict happens for the same person in different room
                                    concurrent_booking_conflict++;
                                    if(concurrent_booking_conflict >= users[0].maxBookings){
                                        // concurrent booking conflict invalid
                                        // e.g. user tries to book the same time period for two different rooms, but his maxBooking value is 1
                                        result.result = "error";
                                        result.errMsg = "You can only book " + users[0].maxBookings + " rooms for the same time period";
                                    }
                                }
                            }
                        });
                        var newBooking = {
                            rid: room_id,
                            uid: users[0].id,
                            start: start,
                            end: end,
                            title: title,
                            name: req.body.room_id,
                        };
                        if(result.result == "error"){
                            res.send(JSON.stringify(result));
                        }else{
                            req.models.BookingRecord.create(newBooking, function(err, results) {
                                if(err){
                                    res.status(500).end(); // internal server error
                                }else{
                                    var result = new Object();
                                    result.result = "success";
                                    res.send(JSON.stringify(result));
                                }
                            });
                        }                     
                    }
                });
            }            
            // req.models.BookingRecord.find({uid: users[0].id},function (err, records) {
            //     if (err) { // if error occurs or no room is found
            //         res.status(500).end(); // internal server error
            //     }else{
            //         if(users[0].maxBookings <= 0){
            //             // The user has reach the maximum booking number
            //             var result = new Object();
            //             result.result = "error";
            //             result.errMsg = "You are not allowed to book a room, please double-check or contact admin";
            //             res.send(JSON.stringify(result));
            //         }else{
            //             // Try to book this room
            //             req.models.BookingRecord.find({rid: room_id},function (err, records) {
            //                 if (err) { // if error occurs or no room is found
            //                     res.status(500).end(); // internal server error
            //                 }else{
            //                     records.forEach(function(record) {
            //                         // Check whether there is conflict
            //                         if((Date.parse ( start ) < Date.parse ( record.start )
            //                             && Date.parse ( end ) > Date.parse ( record.start ))
            //                             || ( Date.parse ( start ) >= Date.parse ( record.start )
            //                                  && Date.parse ( start ) <= Date.parse ( record.end ))
            //                             || (Date.parse ( start ) >= Date.parse ( end ))){
            //                             var result = new Object();
            //                             result.result = "error";
            //                             result.errMsg = "There is time slot conflict, please refresh your page to get up-to-date calendar";
            //                             res.send(JSON.stringify(result));
            //                         }else{

            //                         }
            //                     });
            //                     var newBooking = {
            //                         rid: room_id,
            //                         uid: users[0].id,
            //                         start: start,
            //                         end: end,
            //                         title: title,
            //                         name: req.body.room_id,
            //                     };
            //                     req.models.BookingRecord.create(newBooking, function(err, results) {
            //                         if(err){
            //                             res.status(500).end(); // internal server error
            //                         }else{
            //                             var result = new Object();
            //                             result.result = "success";
            //                             res.send(JSON.stringify(result));
            //                         }
            //                     });
            //                 }
            //             });
            //         }
            //     }
            // });
        }
    });
});

module.exports = router;