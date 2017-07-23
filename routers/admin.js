/*
 * Author(s)  : Chen Song
 * Description: This file handles admin logics. The entire file is protected by auth
 * Last Update: July 15, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. Admin authetication
var adminAuth = require('../authentication/admin.js');
router.use(adminAuth);
// 3. csurf protection
var csurf = require('csurf'); 
var csrfProtection = csurf({ cookie: true });
router.use(csrfProtection);
////////////////////////////////////////////////////////


/*
 * Author(s)  : Chen Song
 * Description: This function sends users the privileges page
 * Last Update: July 15, 2017
*/
router.get('/privileges', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var privileges = [];
    
    req.models.Privilege.find(function (err, results) {
        if (err) {
            res.sendStatus(500); // internal server error
        } else {
            for (var i = 0; i < results.length; i++) {
                privileges.push({
                    id: results[i].id,
                    description: results[i].description,
                    allowAdmin: results[i].allowAdmin,
                    maxBookings: results[i].maxBookings
                });
            }
            res.render('admin-privileges', {
                username: username,
                source: source,
                page: 'Managements Privileges', // modified for multi-level dropdown in sidebar -- Chen
                allowAdmin: true,
                privileges: privileges,
                csrfToken: req.csrfToken()
            });
        }
    });
});

/*
 * Author(s)  : Chen Song
 * Description: This function sends users the usergroup page
 * Last Update: July 15, 2017
*/
router.get('/usergroup', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var users = [];
    var usergroups = [];

    req.models.UserDisplay.find(function (err, results) {
        if (err) {
            res.sendStatus(500); // internal server error
        } else {
            for (var i = 0; i < results.length; i++) {
                users.push({
                    id: results[i].id,
                    username: results[i].username,
                    email: results[i].email,
                    type: results[i].type,
                    usergroup: results[i].usergroup
                });
            }
            req.models.UserGroup.find(function (err, results) {
                if (err) {
                    res.sendStatus(500); // internal server error
                } else {
                    for (var i = 0; i < results.length; i++) {
                        usergroups.push(results[i].description);
                    }
                    res.render('admin-usergroup', {
                        username: username,
                        source: source,
                        allowAdmin: true,
                        page: 'Managements User Groups', // modified for multi-level dropdown in sidebar -- Chen
                        users: users,
                        usergroups: usergroups,
                        csrfToken: req.csrfToken()
                    });
                }
            });
        }
    });
});

/*
 * Author(s)  : Chen Song
 * Description: This function sends users the rooms page
 * Last Update: July 15, 2017
*/
router.get('/rooms', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var rooms = [];

    req.models.Room.find(function (err, results) {
        if (err) {
            res.sendStatus(500); // internal server error
        } else {
            for (var i = 0; i < results.length; i++) {
                rooms.push({
                    id: results[i].id,
                    number: results[i].number,
                    isBeingMaintained: results[i].isBeingMaintained
                });
            }
            res.render('admin-rooms', {
                username: username,
                source: source,
                allowAdmin: true,
                page: 'Managements Rooms', // modified for multi-level dropdown in sidebar -- Chen
                rooms: rooms,
                csrfToken: req.csrfToken()
            });
        }
    });
});

/*
 * Author(s)  : Chong
 * Description: This function directs admin user to booking management page
 * Last Update: July 21, 2017
*/
router.get('/booking', function (req, res) {
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var regular_records = [];
    var batch_records = [];
    var user_id_name_map = new Object();
    var rooms = [];

    req.models.Room.find(function (err, results) {
        if (err) {
            res.sendStatus(500); // internal server error
        } else {
            for (var i = 0; i < results.length; i++) {
                rooms.push({
                    id: results[i].id,
                    number: results[i].number,
                });
            }
        }
    });

    req.models.UserDisplay.find(function (err, results) {
        if (err) {
            res.sendStatus(500); // internal server error
        } else {
            for (var i = 0; i < results.length; i++) {
                user_id_name_map[results[i].id] = results[i].username;
            }
        }
    });

    req.models.BookingRecord.all(function (err, records) {
        if (err) { // if error occurs or no room is found
            throw err;
            res.status(500).end(); // internal server error
        }else{      
            for (var i = records.length - 1; i >= 0; i--) {
                if(records[i].isBatch){
                    records[i].username = user_id_name_map[records[i].uid];
                    batch_records.push(records[i]);
                }else{
                    records[i].username = user_id_name_map[records[i].uid];
                    records[i].start = records[i].start.replace('T',' ');
                    records[i].end = records[i].end.replace('T',' ');
                    regular_records.push(records[i]);                        
                }
            }
            res.render('admin-booking', {
                username: username,
                source: source,
                allowAdmin: true,
                page: 'Managements Bookings', // modified for multi-level dropdown in sidebar -- Chen
                regular_records: regular_records,
                batch_records: batch_records,
                rooms: rooms,
                csrfToken: req.csrfToken()
            });
        }
    });
});

/*
 * Author(s)  : Chen Song
 * Description: This function allows admin to change someone's usergroup. It is not protected by csrf token. (I don't know how to do that when there are multiple fields in one page)
 * Last Update: July 14, 2017
 * Usage      : The client generates a POST request with 2 fields: id, and usergroup. It will receive 200 if update is successful, and 403 otherwise.
*/
router.post('/usergroup', csrfProtection, function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.id && req.body.usergroup) { // must have these two fields
        req.models.UserDisplay.get(req.body.id, function (err, user) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                req.models.UserGroup.find({description: req.body.usergroup}, function (err, groups) {
                    if (err || groups.length != 1) {
                        res.sendStatus(500); // internal server error, usually because user posts a wrong user group name
                    } else {
                        user.privilege = groups[0].id;
                        user.save(function (err) {
                            if (err) {
                                res.sendStatus(500); // usually because someone posts an invalid usergroup name
                            } else {
                                res.status(200).end(); // success
                            }
                        });
                    }
                });
            }
        });
    } else {
        res.sendStatus(403); // invalid request
    }
});

/*
 * Author(s)  : Chen Song
 * Description: This function allows admin to change someone's administrative status. It is not protected by csrf token. (I don't know how to do that when there are multiple fields in one page)
 * Last Update: July 14, 2017
 * Usage      : The client generates a POST request with 2 fields: id, and allowadmin. It will receive 200 if update is successful, and 403 otherwise.
*/
router.post('/allowadmin', csrfProtection, function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.id && req.body.allowadmin) {
        req.models.Privilege.get(req.body.id, function (err, privilege) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                privilege.allowAdmin = (req.body.allowadmin == 'true');
                privilege.save(function (err) {
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else {
                        res.status(200).end(); // success
                    }
                });
            }
        });
    } else {
        res.sendStatus(403); // invalid request
    }
});

/*
 * Author(s)  : Chen Song
 * Description: This function allows admin to change someone's maximum current booking numbers. It is not protected by csrf token. (I don't know how to do that when there are multiple fields in one page)
 * Last Update: July 14, 2017
 * Usage      : The client generates a POST request with 2 fields: id, and maxbookings. It will receive 200 if update is successful, and 403 otherwise.
*/
router.post('/maxbookings', csrfProtection, function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.id && req.body.maxbookings) {
        req.models.Privilege.get(req.body.id, function (err, privilege) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                privilege.maxBookings = parseInt(req.body.maxbookings);
                privilege.save(function (err) {
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else {
                        res.status(200).end(); // success
                    }
                });
            }
        });
    } else {
        res.sendStatus(403); // invalid request
    }
});


/*
 * Author(s)  : Chen Song
 * Description: This function allows admin to change someone's description. It is not protected by csrf token. (I don't know how to do that when there are multiple fields in one page)
 * Last Update: July 14, 2017
 * Usage      : The client generates a POST request with 2 fields: id, and maxbookings. It will receive 200 if update is successful, and 403 otherwise.
*/
router.post('/description', csrfProtection, function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.id && req.body.description) {
        req.models.Privilege.get(req.body.id, function (err, privilege) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                privilege.description = req.body.description;
                privilege.save(function (err) {
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else {
                        res.status(200).end(); // success
                    }
                });
            }
        });
    } else {
        res.sendStatus(403); // invalid request
    }
});

/*
 * Author(s)  : Chen Song
 * Description: This function allows admin to change the maintenance status of a room. It is not protected by csrf token. (I don't know how to do that when there are multiple fields in one page)
 * Last Update: July 15, 2017
 * Usage      : The client generates a POST request with 2 fields: id, and isbeingmaintained. It will receive 200 if update is successful, and 403 otherwise.
*/
router.post('/rooms', csrfProtection, function (req, res) {
    res.setHeader('Content-Type', 'text/plain');
    if (req.body.id && req.body.isbeingmaintained) {
        req.models.Room.get(req.body.id, function (err, room) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                room.isBeingMaintained = (req.body.isbeingmaintained == 'true');
                room.save(function (err) {
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else {
                        res.status(200).end(); // success
                    }
                });
            }
        });
    } else {
        res.sendStatus(403); // invalid request
    }
});

/*
 * Author(s)  : Chong
 * Description: This function allows admin user to edit user's booking
 * Last Update: July 21, 2017
*/
router.put('/booking/:booking_id', csrfProtection, function (req, res) {
    var allowAdmin = req.userDisplay.allowAdmin;
    if(!allowAdmin){
        res.sendStatus(401);
    }else{
        var rid = "0";
        req.models.Room.find({number:req.body.roomname}, function (err, room) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                rid = room[0].id;
            }
        });
        req.models.BookingRecord.find({id: req.params.booking_id},function (err, records) {
            if (err || records.length != 1) { // if error occurs or not exactly one is found
                res.status(500).end(); // internal server error
            }else{
                if(records[0].isBatch){
                    records[0].rid = rid;
                    records[0].name = req.body.roomname;
                    records[0].start = req.body.start;
                    records[0].end = req.body.end;
                    records[0].rangeStart = req.body.rangeStart;
                    records[0].rangeEnd = req.body.rangeEnd;
                    records[0].dow = req.body.dow;
                }else{
                    records[0].rid = rid;
                    records[0].name = req.body.roomname;
                    records[0].start = req.body.start;
                    records[0].end = req.body.end;
                }
                records[0].save(function (err) {
                    if (err) {
                        res.sendStatus(500); // internal server error
                    } else {
                        res.status(200).end(); // success
                    }
                });
            }
        });
    }
});

/*
 * Author(s)  : Chong
 * Description: This function allows admin user to delete user's booking
 * Last Update: July 21, 2017
*/
router.delete('/booking/:booking_id', csrfProtection, function (req, res) {
    var allowAdmin = req.userDisplay.allowAdmin;
    if(!allowAdmin){
        res.sendStatus(401);
    }else{
        req.models.BookingRecord.find({id: req.params.booking_id},function (err, records) {
            if (err || records.length != 1) { // if error occurs or not exactly one is found
                res.status(500).end(); // internal server error
            }else{
                records[0].remove(function (err) { // callback optional
                    if(err){
                        res.status(500).end(); // internal server error
                    } else{
                        res.status(200).end(); // success
                    }
                });
            }
        });
    }
});

module.exports = router;