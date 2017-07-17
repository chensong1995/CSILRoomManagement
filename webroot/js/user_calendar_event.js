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
    	eventClick: function(event) {
	        if (event.url) {
	        	var confirm_text = "Are you sure that you want to delete this booking recrod?"
	        	confirm_text += "\n\nTitle: " + event.title
	        	confirm_text += "\nRoom: " + event.room
	        	confirm_text += "\nStart: " + event.start.format()
	        	confirm_text += "\nEnd: " + event.end.format()
	        	if (confirm(confirm_text) == true) {
			        jQuery.ajax({
						url: '/user/events' + event.url,
	    				type: 'DELETE',
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


