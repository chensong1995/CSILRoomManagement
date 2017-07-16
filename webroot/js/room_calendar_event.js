$(document).ready(function() {
	var if_selectable = !($('#room-in-maintenance').length);
	var room_id = $('#calendar').attr('name');
	var csrfToken = $('#csrfToken').val();
	$('#calendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay,listWeek'
		},
		dayClick: function(date, jsEvent, view) {
			var today = new Date();
			if(Date.parse (date) < Date.parse (today)){
				// If user click a day before today, show alert
				alert("You cannot book a room in the past!");
			}else if(view.name == 'month' || view.name == 'listWeek') {
				// If user is not in agendaDay view, change the view to agendaDay
				$('#calendar').fullCalendar('changeView', 'agendaDay');
				$('#calendar').fullCalendar('gotoDate', date);      
			}
		},
		selectable: if_selectable,
		selectHelper: true,
		select: function(start, end) {
			var view = $('#calendar').fullCalendar('getView');
			if(view.name == 'agendaWeek' || view.name == 'agendaDay'){
				if(end - start >= 7200000){
					// If user chooses a period longer than 2 hours
					alert("Maximum time of a booking is 2 hour! !");
				}else{
					var title = prompt('Enter your event Title:');
					if (title) {
						jQuery.ajax({
							url: '/booking',
            				type: 'POST',
            				data: {
            					room_id: room_id,
				                start: start.format(),
				                end: end.format(),
				                _csrf: csrfToken,
				            },
				            success: function(data) {
				            	data = JSON.parse(data)
				            	if(data.result == "success"){
				            		alert('booking success');
					            	var eventData = {
										title: title,
										start: start,
										end: end
									};
									$('#calendar').fullCalendar('renderEvent', eventData, true);
				            	}else{
				            		alert("Booking fail with reason: " + data.errMsg);
				            	}
				            	
				            },
						});		
					}else{
						alert("Please enter a title!");
					}
				}
			}
			$('#calendar').fullCalendar('unselect');
		},
		selectOverlap: function(event) {
			var view = $('#calendar').fullCalendar('getView');
			if(view.name == 'agendaWeek' || view.name == 'agendaDay'){
				alert("Overlap is not allowed!!");
				$('#calendar').fullCalendar('unselect');
		        return false;
		    }else{
		    	return true;
		    }
	    },
		navLinks: true, // can click day/week names to navigate views
		editable: false,
		eventLimit: true, // allow "more" link when too many events
		events: {
			url: '/booking/events/' + $('#calendar').attr('name'),
			error: function() {
				alert("Fail to load records for room, please refresh or contact admin")
			}
		}
	});
});


