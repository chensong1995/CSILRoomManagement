////////////////////////////////////////////////////////

// Author(s)  : Chong, Chen Song, John Liu
// Description: This function tests the pug template file
// Last Update: Aug 04, 2017

// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();

var async = require('async'); //Require async for multiple queries
router.get('/dashboard', function(req, res) {
    async.parallel({
        currentUser: function(callback){
            req.models.UserDisplay.find({sid: req.cookies.sid}, function(err, user){
                if(err){
                    console.log(err);
                    return;
                }
                callback(null, user[0]);
            })
        },
        Machines: function (callback) {
            req.models.Machine.all(function (err, machines) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                }
                var machines_retrieved = [];
                machines.forEach(function (machine) {
                    var tmpMachineObj = new Object();
                    tmpMachineObj.id = machine.id;
                    tmpMachineObj.name = machine.name;
                    tmpMachineObj.room = machine.room;
                    tmpMachineObj.available = machine.available;
                    tmpMachineObj.heartbeat = machine.heartbeat;
                    tmpMachineObj.coordinate_x = machine.coordinate_x;
                    tmpMachineObj.coordinate_y = machine.coordinate_y;
                    machines_retrieved.push(tmpMachineObj);
                });
                callback(null, machines_retrieved);
            })
        },
        Rooms: function(callback){
            req.models.Room.all(function(err, rooms){
                if(err){
                    console.log(err);
                    res.status(500).end();
                }
                var rooms_retrieved = [];
                rooms.forEach(function (room){
                    var tmpRoomObj = new Object();
                    tmpRoomObj.id = room.id;
                    tmpRoomObj.number = room.number;
                    tmpRoomObj.isBeingMaintained = room.isBeingMaintained;
                    tmpRoomObj.available = true;
                    tmpRoomObj.coordinate_x = room.coordinate_x;
                    tmpRoomObj.coordinate_y = room.coordinate_y;
                    tmpRoomObj.width = room.width;
                    tmpRoomObj.height = room.height;
                    rooms_retrieved.push(tmpRoomObj);
                });
                callback(null, rooms_retrieved);
            })
        },
        Booking: function(callback){
            req.models.BookingRecord.all(function(err, records){
                if(err){
                    console.log(err);
                    res.status(500).end;
                }
                var records_retrieved = [];
                records.forEach(function(record){
                    var tmpRecordObj = new Object();
                    tmpRecordObj.id = record.id;
                    tmpRecordObj.rid = record.rid;
                    tmpRecordObj.start = record.start;
                    tmpRecordObj.end = record.end;
                    tmpRecordObj.isBatch = record.isBatch;
                    tmpRecordObj.rangeStart = record.rangeStart;
                    tmpRecordObj.rangeEnd = record.rangeEnd;
                    records_retrieved.push(tmpRecordObj);
                })
                callback(null, records_retrieved);
            });
        }
    },function(err, results){
        var username = (results.currentUser)?results.currentUser.username:"Visitor";
        var notloggedIn = (username == "Visitor")?true:false;
        var allowAdmin = (results.currentUser)?results.currentUser.allowAdmin:false;
        res.render('dashboard', { username: username, allowAdmin: allowAdmin, page: "Dashboard",
            notloggedIn: notloggedIn,
            machines: JSON.stringify(results.Machines),
            rooms: JSON.stringify(results.Rooms),
            records: JSON.stringify(results.Booking),
        });
    });
});

module.exports = router;