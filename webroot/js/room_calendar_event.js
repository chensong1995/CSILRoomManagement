$(document).ready(function() {
	var if_selectable = !($('#room-in-maintenance').length);
	var room_id = $('#calendar').attr('name');
	var csrfToken = $('#csrfToken').val();
	var overlap_warning = false;
	$('#calendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay,listWeek'
		},
		dayClick: function(date, jsEvent, view) {
			var today = new Date();
			today.setHours(0,0,0,0);
			if(Date.parse (date) < Date.parse (today) - today.getTimezoneOffset() * 60000 ){
				// If user click a day before today, show alert
				alert("You cannot book a room in the past!");
			}else if(view.name == 'month' || view.name == 'listWeek') {
				// If user is not in agendaDay view, change the view to agendaDay
				$('#calendar').fullCalendar('changeView', 'agendaDay');
				$('#calendar').fullCalendar('gotoDate', date);      
			}
			if(!if_selectable){
				alert("This room is in maintenance. You can only check the status. You cannot book it");
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
					var confirm_text = "Do you want to make this event a repeating event (e.g. Every Monday at the time you choose)"
					confirm_text += "\n\nClick 'Batch Booking' for booking it as a repeating event";
					confirm_text += "\nClick 'Regular Booking' for booking it as a event only happens once";

					bootbox.dialog({
					    message: confirm_text,
					    buttons: {
					        confirm: {
					            label: 'Batch Booking',
					            className: 'btn-success',
					            callback: function(){
					            	window.location.href = "/booking/batch?start=" + start + "&end=" + end + "&room_number=" + room_id;
					            }
					        },
					        cancel: {
					            label: 'Regular Booking',
					            className: 'btn-danger',
					            callback: function(){
					            	var title = prompt('Enter your event Title:');
									if (title) {
										jQuery.ajax({
											url: '/booking',
											type: 'POST',
											data: {
												room_id: room_id,
								                start: start.format(),
								                end: end.format(),
								                title: title,
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
													//$('#calendar').fullCalendar('renderEvent', eventData, true);
													$('#calendar').fullCalendar( 'refetchEvents' );
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
					    }
					});					
				}
			}
			$('#calendar').fullCalendar('unselect');
		},
		selectOverlap: function(event) {
			var view = $('#calendar').fullCalendar('getView');
			if(view.name == 'agendaWeek' || view.name == 'agendaDay'){
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
		},
		eventRender: function(event, element, view){
			if(event.username){
				element.append("<p>Booked by: " + event.username + "</p>");
			}
			if(!event.rangeStart){
				return true;
			}else{
				return ((Date.parse(moment(event.start).format("YYYY-MM-DD"))) >= (Date.parse(event.rangeStart)))
					&& ((Date.parse(moment(event.end).format("YYYY-MM-DD"))) <= (Date.parse(event.rangeEnd)));
			}
		},
		loading: function(bool) {
			$('#loader').toggle(bool);
		}
	});
});


