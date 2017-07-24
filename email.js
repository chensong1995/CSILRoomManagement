/*
 * Author(s)  : Ruiming Jia
 * Description: This is the email notification model
 * Last Update: July 10, 2017
*/
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');

//send email

function sendEmail(email, subject, text){
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'csilroombooking@gmail.com',
            pass: 'csilcsilcsil123'
        }
    });
    var mailOptions = {
        from: 'Csil Booking System <csilroombooking@gmail.com style="margin: 0pt; padding: 0pt;">', // sender address
        to: email, // list of receivers
        subject: subject,//'Room Booking Reminder', // Subject line
        //text: text,//'Hello, you have 30 minutes left for your room reservation.', // plaintext body
        html: '<h2>' + subject + '</h2> <p>' + text + '</p>' + '<p>' + 'Thank you,' + '</p>' + 
        '<p>' + 'Csil Booking System' + '</p>'// html body
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}

//example:

var email = 'ruimingj@sfu.ca' //email address of the receiver
var subject = 'Email subject' //email subject
var text = 'This is a test email.' //email body
sendEmail(email, subject, text);


//send email at a specific time
//set year, month, hour, minute
//var year = ...
/*
var date = new Date(year, month-1, day, hour, minute, 0); 
//example: var date = new Date(2017, 6, 22, 15, 16, 0);  Year:2017, Month:6(June) month is from 0 to 11, Hour:15, Minutes:16, Second:0

var EmailAtTime = schedule.scheduleJob(date, function() {
    sendEmail(email,subject,text);
});
*/

//To cancel an email schedule: EmailAtTime.cancel();
