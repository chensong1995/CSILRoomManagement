$(document).ready(function() {
	var csrfToken = $('#csrfToken').val();
	$('#calendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay,listWeek'
		},
		dayClick: function(date, jsEvent, view) {
			if(view.name == 'month' || view.name == 'listWeek') {
				// If user is not in agendaDay view, change the view to agendaDay
				$('#calendar').fullCalendar('changeView', 'agendaDay');
				$('#calendar').fullCalendar('gotoDate', date);      
			}
		},
		navLinks: true, // can click day/week names to navigate views
		editable: false,
		eventLimit: true, // allow "more" link when too many events
		events: {
			url: '/user/events',
			error: function() {
				alert("Fail to load records for room, please refresh or contact admin")
			}
		},
		eventRender: function(event, element, view){
			if(event.roomname){
				console.log(element);
				element.append("<p>Room: " + event.roomname + "</p>");
			}
			if(!event.rangeStart){
				return true;
			}else{
				return ((Date.parse(moment(event.start).format("YYYY-MM-DD"))) >= (Date.parse(event.rangeStart)))
					&& ((Date.parse(moment(event.end).format("YYYY-MM-DD"))) <= (Date.parse(event.rangeEnd)));
			}
		},
    	eventClick: function(event) {
	        if (event.url) {
	        	if(event.isBatch){
    				var confirm_text = "Are you sure that you want to delete this batch booking recrod?"
    				confirm_text += "\nWhich means you are trying to delete"
		        	confirm_text += "\n\nTitle: " + event.title
		        	confirm_text += "\nRoom: " + event.room
		        	confirm_text += "\nFrom " + event.start.format("hh:mm a") + " to " + event.end.format("hh:mm a")
		        	confirm_text += "\nEvery "
		        	var weekday = new Array(7);
		        	weekday[0] =  "Sunday";
					weekday[1] = "Monday";
					weekday[2] = "Tuesday";
					weekday[3] = "Wednesday";
					weekday[4] = "Thursday";
					weekday[5] = "Friday";
					weekday[6] = "Saturday";
		        	JSON.parse(event.dow).forEach(function(day){
		        		confirm_text += weekday[day] + " "
		        	});
    			}else{
    				var confirm_text = "Are you sure that you want to delete this booking recrod?"
		        	confirm_text += "\n\nTitle: " + event.title
		        	confirm_text += "\nRoom: " + event.room
		        	confirm_text += "\nStart: " + event.start.format("YYYY-MM-DD") + " " + event.start.format("hh:mm a")
		        	confirm_text += "\nEnd: " + event.end.format("YYYY-MM-DD") + " " + event.end.format("hh:mm a")
		        }	    
		        if (confirm(confirm_text) == true) {
			        jQuery.ajax({
						url: '/user/events' + event.url,
	    				type: 'DELETE',
	    				data: {
			                _csrf: csrfToken,
			            },
			            success: function(data) {
			            	alert("Successfully delete this booking slot");
			            	$('#calendar').fullCalendar( 'refetchEvents' );
			            },
			            error: function(data) {
			            	alert("Fail to delete this booking slot, please try again or contact admin");
			            	$('#calendar').fullCalendar( 'refetchEvents' );
			            },
					});
			    } else {
			        $('#calendar').fullCalendar( 'refetchEvents' );
			    }
	            return false;
	        }
    	}
	});
});


