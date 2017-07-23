/*
 * Author(s)  : Chen Song
 * Description: This file handles announcement logics. The entire file is protected by auth
 * Last Update: July 22, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
// 2. Admin authetication
var adminAuth = require('../authentication/admin.js');
// 3. csurf protection
var csurf = require('csurf'); 
var csrfProtection = csurf({ cookie: true });
router.use(csrfProtection);
// 4. Slug
var slug = require('slug')
// 5. orm
var orm = require('orm');
////////////////////////////////////////////////////////

/*
 * Author(s)  : Chen Song
 * Description: This function sends users the announcement homepage
 * Last Update: July 22, 2017
*/
router.get('/', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var page = "Announcements";
    var announcements = [];
    var message = undefined;
    if (req.query.message) {
        message = req.query.message;
    }
    // id=1 is the csil policy, ignore it
    // sort by time, desc
    req.models.Announcement.find({id: orm.gt(1)}, [ "time", "Z" ], function (err, results) {
        if (err) {
            res.sendStatus(500); // internal server error
        } else {
            for (var i = 0; i < results.length; i++) {
                announcements.push({
                    title: results[i].title,
                    time: results[i].time.toLocaleString(undefined, {timeZone: 'America/Vancouver'}),
                    path: '/announcement/' + results[i].slug
                });
            }
            res.render('announcement', {
                username: username,
                source: source,
                allowAdmin: allowAdmin,
                page: page,
                message: message,
                announcements: announcements
            });
        }
    });
});

/*
 * Author(s)  : Chen Song
 * Description: This function sends users the new announcement page
 * Last Update: July 15, 2017
*/
router.get('/new', adminAuth, function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var page = "Announcements";
    res.render('announcement-new', {
        username: username,
        source: source,
        allowAdmin: allowAdmin,
        page: page,
        csrfToken: req.csrfToken()
    });
});

/*
 * Author(s)  : Chen Song
 * Description: This function allows admin to create an announcement
 * Last Update: July 15, 2017
 * Usage      : The client generates a POST request with 2 fields: title, and content (plus csrf token). It will be redirected to /announcement if creation success, and 403 if otherwise.
*/
router.post('/new', [adminAuth, csrfProtection], function (req, res) {
    if (req.body.title && req.body.content !== undefined && req.body.title.length != 0) { // must have these fields
        var time = new Date();
        req.models.Announcement.create({
            title: req.body.title,
            content: req.body.content,
            time: time,
            slug: slug(req.body.title)
        }, function (err) {
            if (err) {
                res.sendStatus(500); // internal server error
            } else {
                res.status(200).end(); // success
            }
        });
    } else {
        res.sendStatus(403); // invalid request
    }
});

/*
 * Author(s)  : Chen Song
 * Description: This function sends users the announcement content page
 * Last Update: July 15, 2017
*/
router.get('/:slug', function (req, res) {
    // prepare all view variables
    var username = req.userDisplay.username;
    var source = req.userDisplay.type == 'other' ? 'CSIL Account' : 'SFU Central Authentication Service';
    var allowAdmin = req.userDisplay.allowAdmin;
    var page = "Announcements";
    var announcement = {};
    req.models.Announcement.find({slug: req.params.slug}, function (err, results) {
        if (err || results.length != 1) {
            res.sendStatus(500); // internal server error
        } else {
            announcement = {
                title: results[0].title,
                content: results[0].content,
                lastUpdate: results[0].time.toLocaleString(undefined, {timeZone: 'America/Vancouver'})
            };
            res.render('announcement-view', {
                username: username,
                source: source,
                allowAdmin: allowAdmin,
                page: page,
                announcement: announcement,
                csrfToken: req.csrfToken()
            });
        }
    });
});

/*
 * Author(s)  : Chen Song
 * Description: This function admins to edit an announcement
 * Last Update: July 15, 2017
*/
router.post('/:slug', [adminAuth, csrfProtection], function (req, res) {
    if (req.body.content !== undefined) { // must have these fields
        // prepare all view variables
        req.models.Announcement.find({slug: req.params.slug}, function (err, results) {
            if (err || results.length != 1) {
                res.sendStatus(500); // internal server error
            } else {
                results[0].content = req.body.content;
                results[0].time = new Date();
                results[0].save(function (err) {
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