/*
 * Author(s)  : Chen Song
 * Description: This file handles users profile editing
 * Last Update: July 13, 2017
*/

////////////////////////////////////////////////////////
// External dependencies
// 1. Express framework
var express = require('express');
var router = express.Router();
////////////////////////////////////////////////////////

router.get('/', function (req, res) {
	res.render('profile', {username: req.username});
});

module.exports = router;