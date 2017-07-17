var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');

router.get('/', function(req, res){
    //res.sendFile(path.resolve(__dirname, '../client/static/home.html'));
    req.models.Machine.all(function(err, machines){
        if(err){
            console.log(err);
            res.status(500).end();
        }
        var machines_retrieved = [];
        machines.forEach(function(machine){
            var tmpMachineObj = new Object();
            tmpMachineObj.id = machine.id;
            tmpMachineObj.name = machine.name;
            tmpMachineObj.room = machine.room;
            tmpMachineObj.heartbeat = machine.heartbeat;
            machines_retrieved.push(tmpMachineObj);
        });
        //res.sendFile(path.resolve(__dirname, '../client/static/home.html'));
        res.render(path.resolve(__dirname, '../client/static/home.pug'), {title: 'Machines overview', machines: JSON.stringify(machines_retrieved)});
    })
});

router.get('/:id', function(req, res){
    req.models.Machine.find({id: req.body.id}, function(err, Machine_found){

    });
});

module.exports = router;