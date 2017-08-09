// Author(s)  : Chong

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();

// 3. ical generator
var ical = require('ical-generator');

////////////////////////////////////////////////////////

// Author(s)  : Chong
// Description: This function returns the ical feed
// Last Update: July 22, 2017
router.get('/:ical_key', function(req, res) {
    req.models.CalendarKey.find({ckey:req.params.ical_key},function(err, keys){
        if (err || keys.length < 1) { // if error occurs
            res.status(404).end(); // internal server error
        }else{
            var uid = keys[0].uid;
            req.models.BookingRecord.find({uid: uid},function (err, records) {
                if (err) { // if error occurs or no room is found
                    res.status(500).end(); // internal server error
                }else{
                    cal = ical({
                        domain: 'www.sfu.ca/csil',
                        prodId: {company: 'SFU', product: 'CSIL Booking System'},
                        name: 'Booking Calendar',
                        timezone: 'America/Vancouver'
                    });
                    records.forEach(function(record) {
                        if(record.isBatch){
                            var batch_record_list = extendBatchRecords(
                                                        record.rid,
                                                        record.uid,
                                                        record.title,
                                                        record.number,
                                                        record.start,
                                                        record.end,
                                                        record.rangeStart,
                                                        record.rangeEnd,
                                                        record.dow);
                            batch_record_list.forEach(function(record) {
                                cal.events([
                                    {
                                        start: new Date(record.start),
                                        end: new Date(record.end),
                                        summary: record.title,
                                        description: record.name
                                    }
                                ]);
                            });
                        }else {
                            cal.events([
                                {
                                    start: new Date(record.start),
                                    end: new Date(record.end),
                                    summary: record.title,
                                    description: record.name
                                }
                            ]);
                        }
                    });
                    cal.serve(res);
                }
            });
        }
    });
});

function extendBatchRecords(roomId, userId, title, roomName, startTime, endTime, startDate, endDate, dow){
    var extended_record_list = [];
    var dowList = JSON.parse(dow);
    var start = new Date(startDate);
    var end = new Date(endDate);
    for (var d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dowList.forEach(function(dow){
            if(dow / 1 == (d.getDay() / 1 + 1) % 7){
                var startString = "";
                var endString = "";
                var dd = d.getDate();
                var mm = d.getMonth()+1; //January is 0!
                var yyyy = d.getFullYear();

                if(dd<10) {
                    dd = '0'+dd
                } 

                if(mm<10) {
                    mm = '0'+mm
                }
                startString += yyyy + "-" + mm + "-" + dd + "T" + startTime + ":00";
                endString = yyyy + "-" + mm + "-" + dd + "T" + endTime + ":00";
                var booking_record = {
                    rid: roomId,
                    uid: userId,
                    start: startString,
                    end: endString,
                    title: title,
                    name: roomName,
                };
                extended_record_list.push(booking_record);
            }
        });
    }
    return extended_record_list;
}

module.exports = router;
