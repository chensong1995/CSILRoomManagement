// Author(s)  : John Liu
// Description: Functions for handling socket event listening and event emitting
// Last Update: July 17, 2017

var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');
var orm = require("orm");


var machine = {
    id: String,         // e.g. 1, 2, 3
    name: String,       // e.g. a01, a02, a03
    room: String,       // e.g. ASB9700, ASB9804
    available: Boolean, // e.g. true, false
    heartbeat: Date,     // Unix timestamp
    coordinate_x: Number, //X coordiante of machine in csil
    coordinate_y: Number, // Y coordiante of machine in csil
};

const connectionString = 'mysql://csil:csil@120.27.121.163/csil';

module.exports = function(io){
    //setInterval(function(){console.log("hello");}, 3000);
    io.sockets.on('connection', function(socket){ //Socket event listener
        orm.connect(connectionString, function(err, db){ //Connect to db
            var Machine = db.define('machines_display', machine);
            setInterval(function(){
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
                   console.log(new_machine_status[16].available);
                  io.sockets.emit("MachinesUpdate", new_machine_status); //Attach new machines status in event and emit the event to clients
               });
            }, 60000); //Update machines status every 60 sec
            socket.on("MachineColorChange", function(machine_indx){ //On receiving a MachineColorChange event
                io.sockets.emit("MachineColorChange", machine_indx); //Emit MachineColorChange event to all listeners
            });
        });
    });
};