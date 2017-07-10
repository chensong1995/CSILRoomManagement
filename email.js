var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'csilroombooking@gmail.com',
		pass: 'csilcsilcsil123'
	}
});

var mailOptions = {
    from: 'Csil Booking System <csilroombooking@gmail.com style="margin: 0pt; padding: 0pt;">', // sender address
    to: 'ruimingj@sfu.ca', // list of receivers
    subject: 'Room Booking Reminder', // Subject line
    text: 'Hello, you have 30 minutes left for your room reservation.', // plaintext body
    html: '<b>Hello, you have 30 minutes left for your room reservation.</b>' // html body
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});