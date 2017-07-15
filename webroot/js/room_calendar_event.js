$(document).ready(function() {
	$('#calendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay,listWeek'
		},
		dayClick: function(date, jsEvent, view) {
			if(view.name == 'month' || view.name == 'listWeek') {
				$('#calendar').fullCalendar('changeView', 'agendaDay');
				$('#calendar').fullCalendar('gotoDate', date);      
			}
		},
		selectable: true,
		selectHelper: true,
		select: function(start, end) {
			var view = $('#calendar').fullCalendar('getView'); 
			if(view.name == 'agendaWeek' || view.name == 'agendaDay'){
				if(end - start >= 7200000){
					alert("Maximum time of a booking is 2 hour! !");
				}else{
					var title = prompt('Enter your event Title:');
					var eventData;
					if (title) {
						eventData = {
							title: title,
							start: start,
							end: end
						};
						$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
					}
				}
			}
			$('#calendar').fullCalendar('unselect');
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