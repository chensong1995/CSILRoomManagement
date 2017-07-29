/*
 * Author(s)  : Chen Song, Chong
 * Description: This is the entry of the web server logic
 * Last Update: July 14, 2017
 */
////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var app = express();
// 2. Body Parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// 3. Cookie Parser
var cookieParser = require('cookie-parser');
app.use(cookieParser());
// 4. path
var path = require('path');
// 5. Socket.io setup
////////////////////////////////////////////////////////


////////////////////////////////////////////////////////
// Our own middlewares
// 1. Connect to models
var models = require('./models/models.js');
models(app);
// 2. Cookie
var cookie = require('./authentication/cookie.js');
cookie(app);
// 2. Authentication service
var auth = require('./authentication/authentication.js');

//serve static files
app.use(express.static(path.join(__dirname, 'client/static')));
////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
// Connect to routers
// 1. Machine live status API
var live = require('./routers/live.js');
app.use('/live', live);
// 2. Login
var login = require('./routers/login.js');
app.use('/login', login);
// 3. Logout
var logout = require('./routers/logout.js');
app.use('/logout', auth, logout);
// 4. Signup
var signup = require('./routers/signup.js');
app.use('/signup', signup);
// 5. Machine
var machine = require('./routers/machine.js');
app.use('/machine', machine);
// 6. Profile
var profile = require('./routers/profile.js');
app.use('/profile', auth, profile);
// 7. Password
var password = require('./routers/password.js');
app.use('/password', auth, password);
// 8. Admin
var admin = require('./routers/admin.js');
app.use('/admin', auth, admin);
// 9. Room Booking
var booking = require('./routers/booking.js');
app.use('/booking', auth, booking);
// 10. Policy
var policy = require('./routers/policy.js');
app.use('/policy', auth, policy);
// 11. Announcement
var announcement = require('./routers/announcement.js');
app.use('/announcement', auth, announcement);
// 12. User
var user = require('./routers/users.js');
app.use('/user', auth, user);
// 13. Feedback, comment, report violation
var comment = require('./routers/comment.js');
app.use('/comment', auth, comment);
// 14. ical feed
var icalfeed = require('./routers/icalfeed.js');
app.use('/icalfeed', icalfeed);

////////////////////////////////////////////////////////

////////////////////////////////////////////////////////
// Set template engine
app.set('view engine', 'pug');
// Set view folder location
app.set('views', path.join(__dirname, 'views'));
////////////////////////////////////////////////////////


// Author(s)  : Chong, Chen Song, John Liu
// Description: This function tests the pug template file
// Last Update: July 22, 2017
var async = require('async'); //Require async for multiple queries
app.get('/dashboard', function(req, res) {
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

// Author(s)  : Chen Song, John Liu
// Description: This function starts the web server
//              Requires and initiate socket.io
// Last Update: July 17, 2017
var server = app.listen(3000, function() {
    console.log('Listening at port 3000');
});
var io = require('socket.io').listen(server);
require('./routers/machineEmit.js')(io);
