// Author(s)  : John Liu
// Description: Functions for handling socket event listening and event emitting
// Last Update: July 17, 2017

var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');
var orm = require("orm");
var async = require('async')


var machine = {
    id: String,         // e.g. 1, 2, 3
    name: String,       // e.g. a01, a02, a03
    room: String,       // e.g. ASB9700, ASB9804
    available: Boolean, // e.g. true, false
    heartbeat: Date,     // Unix timestamp
    coordinate_x: Number, //X coordiante of machine in csil
    coordinate_y: Number, // Y coordiante of machine in csil
};

var booking = {
    id: String,           // e.g. 1, 2, 3 , the id of this record
    rid: String,          // e.g. 1, 2, 3 , the id of room
    uid: String,          // e.g. 1, 2, 3 , the id of user
    start: String,		  // e.g. 2017-05-09T16:00:00-05:00, timestamp of the beginning of the booking
    end: String,          // e.g. 2017-05-09T16:00:00-05:00, timestamp of the end of the booking
    title: String,        // e.g. CMPT 470 Office Hour, title of the booking
    name: String,         // e.g. ASB9400
    isBatch: Boolean,     // e.g. true or false
    dow: String,          // e.g. [1, 4, 7] means every Mon., Thu. and Sun.
    rangeStart: String,   // e.g. 2017-05-09
    rangeEnd: String      // e.g. 2017-07-09
};

//const connectionString = 'mysql://csil:csil@120.27.121.163/csil';
const connectionString = 'mysql://root:password@13.59.137.163/csil';

module.exports = function(io){
    orm.connect(connectionString, function(err, db){ //Connect to db
        var Machine = db.define('machines_display', machine);
        var Booking = db.define('booking', booking);
        setInterval(function(){
            async.parallel({
                UpdatedMachines: function(callback){
                    Machine.all(function(err, machines_retrieved){
                        if(err){
                            throw(err);
                            console.log(err);
                            return;
                        };
                        var new_machine_status = [];
                        machines_retrieved.forEach(function(machineObj){

                            tmpMachineObj = new Object();
                            tmpMachineObj.id = machineObj.id;
                            tmpMachineObj.name = machineObj.name;
                            tmpMachineObj.room = machineObj.room;
                            tmpMachineObj.available = machineObj.available;
                            tmpMachineObj.heartbeat = machineObj.heartbeat;
                            tmpMachineObj.coordinate_x = machineObj.coordinate_x;
                            tmpMachineObj.coordinate_y = machineObj.coordinate_y;
                            new_machine_status.push(tmpMachineObj);
                        });
                        callback(null, new_machine_status);
                    });
                },
                UpdatedRecords: function(callback){
                    Booking.all(function(err, records){
                        if(err){
                            console.log(err);
                            return;
                        };
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
                        });
                        callback(null, records_retrieved);
                    })
                }
            },function(err, results){
                io.sockets.emit("MachinesUpdate", results.UpdatedMachines); //Attach new machines status in event and emit the event to clients
                io.sockets.emit("UpdateRecord", results.UpdatedRecords); //Attach new booking records in event and emit the event to clients
            });
        }, 60000); //Update machines status and booking records every 60 sec
    io.sockets.on('connection', function(socket){ //Socket event listener
            socket.on("MachineColorChange", function(machine_indx){ //On receiving a MachineColorChange event
                orm.connect(connectionString, function(err, db){
                    var Machine = db.define('machines_display', machine);
                    Machine.get(machine_indx, function(err, Machine_found){
                        if(err){
                            console.log(err);
                            return;
                        }
                        Machine_found.available = !Machine_found.available; //// Change machine's availability status
                        Machine_found.save(function(err){
                            if(err){
                                console.log(err);
                                return;
                            }
                        })
                    })
                });
                io.sockets.emit("MachineColorChange", machine_indx); //Emit MachineColorChange event to all listeners
            });
        });
    });
};