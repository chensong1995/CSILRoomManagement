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
                    maxBookings: results[i].maxBookings,
                });
            }
            res.render('admin-privileges', {
                username: username,
                source: source,
                page: 'Privilege Management',
                allowAdmin: true,
                privileges: privileges
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
                        page: 'User Group Management',
                        users: users,
                        usergroups: usergroups
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
                page: 'Room Management',
                rooms: rooms
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
router.post('/usergroup', function (req, res) {
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
router.post('/allowadmin', function (req, res) {
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
router.post('/maxbookings', function (req, res) {
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
router.post('/description', function (req, res) {
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
router.post('/rooms', function (req, res) {
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


module.exports = router;