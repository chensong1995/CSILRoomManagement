var orm = require('orm');
var mailer = require('./email/email.js');

const connectionString = 'mysql://root:password@13.59.137.163/csil';
// Interval between notification check
const timeInterval = 5000;
// How many minutes ahead of the booking will we send the notification
const aheadTime = 30;

var db = orm.connect(connectionString);

var Bookings = db.define("bookings_display", {
	id: String,           // e.g. 1, 2, 3 , the id of this record
    start: String,		  // e.g. 2017-05-09T16:00:00-05:00, timestamp of the beginning of the booking
    end: String,          // e.g. 2017-05-09T16:00:00-05:00, timestamp of the end of the booking
    title: String,        // e.g. CMPT 470 Office Hour, title of the booking
    name: String,         // e.g. ASB9400
    isBatch: Boolean,     // e.g. true or false
    dow: String,          // e.g. [1, 4, 7] means every Mon., Thu. and Sun. 
    rangeStart: String,   // e.g. 2017-05-09
    rangeEnd: String,     // e.g. 2017-07-09
    username: String,     // e.g. admin
    email: String,        // e.g. admin@admin.com
    notification: Number, // 1: require notification, 0: no notification	
});

var lastNotifications = db.define("notifications", {
	id: String,           // e.g. 1, 2, 3 , the id of this record
    email: String,		  // e.g. email to which the notification was sent
    time: String,         // e.g. 2017-05-09T16:00:00-05:00, timestamp of the beginning of the booking
    room: String          // e.g. ASB9400
});

function schedultNotifier() {
	Bookings.all(function (err, records) {
		records.forEach(function(record){
			var isBatchNotification = record.notification;
			var room = record.name;
			var email = record.email;
			var username = record.username;
			if(record.isBatch){
                var batch_record_list = extendBatchRecords(
                                            record.rid,
                                            record.uid,
                                            record.title,
                                            record.number,
                                            record.start,
                                            record.end,
                                            record.rangeStart,
                                            record.rangeEnd,
                                            record.dow);
                batch_record_list.forEach(function(record) {
                	var today = new Date();
                    if(((Date.parse(record.start) - Date.parse(today)) < aheadTime * 60000)
                    	&&((Date.parse(record.start) - Date.parse(today)) > 0)){
                    	console.log("find a batch record to notify");
                    	if (isBatchNotification == 1) { // user wants a notification
                    		lastNotifications.find({email: email}, function (err, records){
                    			if(records.length < 1){
                    				var lastNotification = new Object();
	                                lastNotification.room = room;
	                                lastNotification.time = record.start;
	                                lastNotification.email = email;
	                                lastNotifications.create(lastNotification, function(err, results) {
		                                if(err){
		                                    console.log(err);
		                                }else{
		                                	console.log("send batch notification");
			                    			var subject = 'Your booking will start in ' + aheadTime + ' minutes';
			                                var text = 'Please come to room ' + room + ' in 30 minutes.';
			                                text += ' Your booking will start at ' + record.start.replace('T',' ') ;
			                                mailer.send({
			                                    email: email,
			                                    name: username
			                                }, subject, text);
		                                }
		                            });
                    			}else{
                    				var isNotified = false;
	                				for (var i = 0; i < records.length; i++) {
						                var lastTime = records[i].time;
		                				var lastRoom = records[i].room;
		                				if(lastTime == record.start && lastRoom == room){
		                					isNotified = true;
		                					break;
		                				}
						            }
	                				if(!isNotified){
	                					var lastNotification = new Object();
		                                lastNotification.room = room;
		                                lastNotification.time = record.start;
		                                lastNotification.email = email;
		                                lastNotifications.create(lastNotification, function(err, results) {
			                                if(err){
			                                    console.log(err);
			                                }else{
			                                	console.log("send notification");
				                    			var subject = 'Your booking will start in ' + aheadTime + ' minutes';
				                                var text = 'Please come to room ' + room + ' in 30 minutes.';
				                                text += ' Your booking will start at ' + record.start.replace('T',' ') ;
				                                mailer.send({
				                                    email: email,
				                                    name: username
				                                }, subject, text);
			                                }
			                            });
	                				}
                    			}
                    		});                            
                        }
                    }
                });
            }else {
                var today = new Date();
                if(((Date.parse(record.start) - Date.parse(today)) < aheadTime * 60000)
                	&&((Date.parse(record.start) - Date.parse(today)) > 0)){
                	console.log("find a regular record to notify");
                	if (record.notification == 1) { // user wants a notification
                		lastNotifications.find({email: email}, function (err, records){
                			if(records.length < 1){
                                var lastNotification = new Object();
                                lastNotification.room = room;
                                lastNotification.time = record.start;
                                lastNotification.email = email;
                                lastNotifications.create(lastNotification, function(err, results) {
	                                if(err){
	                                    console.log(err);
	                                }else{
	                                	console.log("send regular notification");
		                    			var subject = 'Your booking will start in ' + aheadTime + ' minutes';
		                                var text = 'Please come to room ' + room + ' in 30 minutes.';
		                                text += ' Your booking will start at ' + record.start.replace('T',' ') ;
		                                mailer.send({
		                                    email: email,
		                                    name: username
		                                }, subject, text);
	                                }
	                            });
                			}else{
                				var isNotified = false;
                				for (var i = 0; i < records.length; i++) {
					                var lastTime = records[i].time;
	                				var lastRoom = records[i].room;
	                				if(lastTime == record.start && lastRoom == room){
	                					isNotified = true;
	                					break;
	                				}
					            }
                				if(!isNotified){
                					var lastNotification = new Object();
	                                lastNotification.room = room;
	                                lastNotification.time = record.start;
	                                lastNotification.email = email;
	                                lastNotifications.create(lastNotification, function(err, results) {
		                                if(err){
		                                    console.log(err);
		                                }else{
		                                	console.log("send notification");
			                    			var subject = 'Your booking will start in ' + aheadTime + ' minutes';
			                                var text = 'Please come to room ' + room + ' in 30 minutes.';
			                                text += ' Your booking will start at ' + record.start.replace('T',' ') ;
			                                mailer.send({
			                                    email: email,
			                                    name: username
			                                }, subject, text);
		                                }
		                            });
                				}
                			}
                		});
                    }
                }
            }
		});
	});
}

function extendBatchRecords(roomId, userId, title, roomName, startTime, endTime, startDate, endDate, dow){
    var extended_record_list = [];
    var dowList = JSON.parse(dow);
    console.log(dowList);
    var start = new Date(startDate);
    console.log(start);
    var end = new Date(endDate);
    console.log(end);
    for (var d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dowList.forEach(function(dow){
            if(dow / 1 == (d.getDay() / 1 + 1) % 7){
                var startString = "";
                var endString = "";
                var dd = d.getDate();
                var mm = d.getMonth()+1; //January is 0!
                var yyyy = d.getFullYear();

                if(dd<10) {
                    dd = '0'+dd
                } 

                if(mm<10) {
                    mm = '0'+mm
                }
                startString += yyyy + "-" + mm + "-" + dd + "T" + startTime + ":00";
                endString = yyyy + "-" + mm + "-" + dd + "T" + endTime + ":00";
                var booking_record = {
                    rid: roomId,
                    uid: userId,
                    start: startString,
                    end: endString,
                    title: title,
                    name: roomName,
                };
                extended_record_list.push(booking_record);
            }
        });
    }
    return extended_record_list;
}

setInterval(schedultNotifier, timeInterval);