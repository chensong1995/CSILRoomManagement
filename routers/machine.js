var express = require('express');
var router = express.Router();
var app = express();
//var http = require('http').Server(app);
//var io = require('socket.io').listen(http);
var path = require('path');

router.get('/', function(req, res){
    //res.sendFile(path.resolve(__dirname, '../client/static/home.html'));
    //res.render(path.resolve(__dirname, '../client/static/home.pug'), {message: 'hello world from pug'});
    req.models.Machine.all()
});

router.get('/:id', function(req, res){
    req.models.Machine.find({id: req.body.id}, function(err, Machine_found){

    });
});

module.exports = router;