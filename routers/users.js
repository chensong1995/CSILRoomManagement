// Author(s)  : Chong

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. csurf protection
var csurf = require('csurf'); 
var csrfProtection = csurf({ cookie: true });
// 3. ical generator
var ical = require('ical-generator');
var bcrypt = require('bcryptjs');
var mailer = require('../email/email.js');
////////////////////////////////////////////////////////

router.use(csrfProtection);

// Author(s)  : Chong
// Description: This function returns the booking records of one user
// Last Update: July 14, 2017
router.get('/events', function(req, res) {
	var room_number = "";
    req.models.BookingRecord.find({uid: req.userDisplay.id},function (err, records) {
        if (err) { // if error occurs or no room is found
            res.status(500).end(); // internal server error
        }else{
        	var today = new Date();
            today.setHours(0,0,0,0);
            var record_list = [];
            var start = today;
            var end = req.query.end;
            records.forEach(function(record) {
                if(record.isBatch){
                    var record_obj = new Object();
                    record_obj.title = record.title
                    record_obj.roomname = record.name
                    record_obj.start = record.start
                    record_obj.end = record.end
                    record_obj.isBatch = record.isBatch;
                    record_obj.dow = record.dow;
                    record_obj.rangeStart = record.rangeStart;
                    record_obj.rangeEnd = record.rangeEnd;
                    record_obj.room = record.name;
                    record_obj.url = '/' + record.id;
                    record_obj.backgroundColor = "#3c763d";
                    record_list.push(record_obj)
                }else {
                    var record_obj = new Object();
                    record_obj.title = record.title;
                    record_obj.roomname = record.name;
                    record_obj.start = record.start;
                    record_obj.end = record.end;
                    record_obj.room = record.name;
                    record_obj.url = '/' + record.id;
                    record_list.push(record_obj)
                }
            });
            res.send(JSON.stringify(record_list));
        }
    });
});

// Author(s)  : Chong
// Description: This function directs user to booking management
// Last Update: July 14, 2017
router.get('/calendar', function(req, res) {
    var username = req.userDisplay.username;
    var userSource = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';

    res.render('booking_calendar', { 
        username: username,
        source: userSource,
        allowAdmin: req.userDisplay.allowAdmin, 
        page: "Bookings My Calendar",
        csrfToken: req.csrfToken(),
    });
});

// Author(s)  : Chong
// Description: This function deletes the booking records of one user
// Parameter  : /:record_id
// Last Update: July 14, 2017
router.delete('/events/:record_id', function(req, res) {
    req.models.BookingRecord.find({id: req.params.record_id},function (err, records) {
        if (err || records.length != 1) { // if error occurs or not exactly one is found
            res.status(500).end(); // internal server error
        }else{
        	records[0].remove(function (err) { // callback optional
			    if(err){
			    	res.status(500).end(); // internal server error
			    }else{
                    if (req.userDisplay.notification == 1) { // user wants a notification
                        var subject = 'Your have successfully deleted a booking record';
                        var text = 'For more details, please check our website';
                        mailer.send({
                            email: req.userDisplay.email,
                            name: req.userDisplay.username
                        }, subject, text);
                    }
                    res.status(200).end(); // success
			    }
			});
        }
    });
});

// Author(s)  : Chong
// Description: This function generates the iCal feed url
// Last Update: July 22, 2017
router.get('/icalkey', function(req, res) {
    var uid = req.userDisplay.id;
    req.models.CalendarKey.find({uid:uid},function(err, keys){
        if (err) { // if error occurs
            res.status(500).end(); // internal server error
        }else{
            if(keys.length < 1){
                var newKey = new Object();
                newKey.uid = uid;
                newKey.ckey = bcrypt.hashSync("" + uid, 10) + ".ics";
                console.log(newKey.ckey);
                req.models.CalendarKey.create(newKey, function(err, results) {
                    if(err){
                        res.status(500).end(); // internal server error
                    }else{
                        var result = new Object();
                        result.result = "success";
                        result.key = newKey.ckey;
                        res.send(JSON.stringify(result));
                    }
                });
            }else{
                var result = new Object();
                result.result = "success";
                result.key = keys[0].ckey;
                res.send(JSON.stringify(result));
            }
        }
    });
});

module.exports = router;
