var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');

module.exports = function(io){
    io.sockets.on('connection', function(socket){
        socket.on("MachineColorChange", function(){
            io.sockets.emit("MachineColorChange");
        });
    });
};