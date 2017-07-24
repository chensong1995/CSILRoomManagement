/*
 * Author(s)  : Ruiming Jia, Chen Song
 * Description: This is file contains the API that allows you to send user an email
 * Last Update: July 24, 2017
*/

/*
 * Instructions for people who want to call this API:
 * 1. Please require this file: var mailer = require('/path/to/this/file')
 * 2. The mailer object contains a send function, which takes 3 parameters:
 *     receiver: an object with 2 attributes (email and name)
 *     subject : a string
 *     text    : a string
 * 3. For example:
 *      mailer.send({
 *        email: 'csa102@sfu.ca',
 *        name: 'csa102'
 *      }, 'Your Password Has Been Changed', 'We noticed that you have recently changed your password on our website. Please report to us if you are confused.')
 * 4. A real example can be found at /routers/password. Please refer to the post request to '/' in this file.
 * 5. Please note that this is an unreliable service: there is no guarantee of delivery (just like UDP)
*/




////////////////////////////////////////////////////////
// External dependencies
// 1. nodemailer --- the email service
var nodemailer = require('nodemailer');
// 2. configurations
var config = require('./config.js');


function send(receiver, subject, text) {
    // Connect to the email server
    var transporter = nodemailer.createTransport({
        service: config.service,
        auth: {
            user: config.address,
            pass: config.password
        }
    });
    // Set email options
    var mailOptions = {
        from: config.name + '<' + config.address + '>',
        to: receiver.email,
        subject: config.generateSubject(subject),
        html: config.generateBody(receiver.name, text)
    };
    // Send!
    transporter.sendMail(mailOptions); // this may fail... but ignore the errors
}
module.exports = {
    send: send
};