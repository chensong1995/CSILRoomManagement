// Author(s)  : John Liu
// Description: Functions for handling socket event listening and event emitting
// Last Update: July 17, 2017

var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');

module.exports = function(io){
    io.sockets.on('connection', function(socket){ //Socket event listener
        socket.on("MachineColorChange", function(machine_indx){ //On receiving a MachineColorChange event
            io.sockets.emit("MachineColorChange", machine_indx); //Emit MachineColorChange event to all listeners
        });
    });
};