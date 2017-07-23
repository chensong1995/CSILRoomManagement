// Author(s)  : Chong

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. csurf protection
var csurf = require('csurf'); 
var csrfProtection = csurf({ cookie: true });
////////////////////////////////////////////////////////

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
			    	res.status(200).end(); // success
			    }
			});
        }
    });
});

// Author(s)  : Chong
// Description: This function generates the iCal feed url
// Last Update: July 22, 2017
router.post('/icalgenerate', function(req, res) {
    res.status(500).end();
});

module.exports = router;
