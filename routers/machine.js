// Author(s)  : John Liu
// Description: Routers for handling machine retrievals
// Last Update: July 17, 2017

var express = require('express');
var router = express.Router();
var app = express();
var path = require('path');

router.get('/', function(req, res){
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
            tmpMachineObj.available = machine.available;
            tmpMachineObj.heartbeat = machine.heartbeat;
            tmpMachineObj.coordinate_x = machine.coordinate_x;
            tmpMachineObj.coordinate_y = machine.coordinate_y;
            machines_retrieved.push(tmpMachineObj);
        });
        res.render(path.resolve(__dirname, '../client/static/home.pug'), {title: 'Machines overview', machines: JSON.stringify(machines_retrieved)});
    })
});

router.post('/:id', function(req, res){
    req.models.Machine.get(req.params.id, function(err, Machine_found){
        if(err){
            console.log(err);
            res.status(500).end();
        }
        Machine_found.available = !Machine_found.available; // Change machine's availability status
        Machine_found.save(function(err){
            if(err){
                console.log(err);
                res.status(500).end();
            }
            res.redirect('back');
        });
    });
});

module.exports = router;