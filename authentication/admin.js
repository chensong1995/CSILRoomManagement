/*
 * Author(s)  : Chen Song
 * Description: This file implements the administrative authentication service as a middleware. If someone other than the admin tries to go through this middleware, he or she will receive a 403
 * Last Update: July 15, 2017
*/

module.exports = function (req, res, next) {
    if (req.userDisplay.allowAdmin) {
        next();
    } else {
        res.sendStatus(403); // forbidden
    }
};