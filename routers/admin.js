/*
 * Author(s)  : Chen Song
 * Description: This file handles admin logics. The entire file is protected by auth
 * Last Update: July 14, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
////////////////////////////////////////////////////////

/*
 * Author(s)  : Chen Song
 * Description: This function makes sure only admins can visit this route
 * Last Update: July 14, 2017
*/
router.use(function (req, res, next) {
    if (req.userDisplay.allowAdmin) {
        next();
    } else {
        res.sendStatus(403); // forbidden
    }
});

/*
 * Author(s)  : Chen Song
 * Description: This function sends users the admin homepage
 * Last Update: July 14, 2017
*/
router.get('/', function (req, res) {
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
                    res.render('admin', {
                        username: username,
                        source: source,
                        allowAdmin: true,
                        users: users,
                        usergroups: usergroups,
                    });
                }
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

module.exports = router;