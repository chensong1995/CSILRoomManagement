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
				bootbox.alert("You cannot book a period in the past!");
			}else if(view.name == 'month' || view.name == 'listWeek') {
				// If user is not in agendaDay view, change the view to agendaDay
				$('#calendar').fullCalendar('changeView', 'agendaDay');
				$('#calendar').fullCalendar('gotoDate', date);      
			}
			if(!if_selectable){
				bootbox.alert("This room is in maintenance. You can only check the status. You cannot book it");
			}
		},
		selectable: if_selectable,
		selectHelper: true,
		select: function(start, end) {
			var view = $('#calendar').fullCalendar('getView');
			if(view.name == 'agendaWeek' || view.name == 'agendaDay'){
				if(end - start > 7200000){
					// If user chooses a period longer than 2 hours
					bootbox.alert("Maximum time of a booking is 2 hour! !");
				}else{
					var confirm_text = "Do you want to make this event a repeating event (e.g. Every Monday at the time you choose)"
					confirm_text += "<p>Click Batch Booking for booking it as a repeating event</p>";
					confirm_text += "<p>Click Regular Booking for booking it as an event only happens once</p>";

					bootbox.dialog({
					    message: confirm_text,
					    buttons: {
					        confirm: {
					            label: 'Batch Booking',
					            className: 'btn-success',
					            callback: function(){
					            	var start_show = start.format('HH:mm');
					            	var end_show = end.format('HH:mm');
					            	//window.location.href = "/booking/batch?start=" + start + "&end=" + end + "&room_number=" + room_id;
					            	bootbox.dialog({
										title: "Booking confirmation",
										message: '<p>Please provide the following information and click the Confirm button</p><br>\
													<div class="form-group"><label for="dtp_input2" class="col-md-2 control-label">Title: </label>\
													<input class="col-md-5" id="booking-title" size="16" type="text" value=""></div><br><br>\
													<div class="form-group"><label for="dtp_input2" class="col-md-2 control-label">Period: </label>\
													<span id="start-time">'+ start_show + '</span><span id=""> - </span><span id="end-time">'+ end_show + '</span></div><br>\
													<div class="form-group"><label for="dtp_input2" class="col-md-2 control-label">From</label>\
													<div class="input-group date form_date col-md-5" data-date="" data-date-format="yyyy-mm-dd" data-link-field="dtp_input2" data-link-format="yyyy-mm-dd">\
														<input class="form-control" id="startDate" size="16" type="text" value="" readonly="">\
															<span class="input-group-addon"><span class="glyphicon glyphicon-remove"></span></span><span class="input-group-addon">\
																<span class="glyphicon glyphicon-calendar">\
																</span>\
															</span>\
													</div></div>\
													<div class="form-group"><label for="dtp_input3" class="col-md-2 control-label">To</label>\
													<div class="input-group date form_date col-md-5" data-date="" data-date-format="yyyy-mm-dd" data-link-field="dtp_input3" data-link-format="yyyy-mm-dd">\
														<input class="form-control" id="endDate" size="16" type="text" value="" readonly="">\
															<span class="input-group-addon"><span class="glyphicon glyphicon-remove"></span></span><span class="input-group-addon">\
																<span class="glyphicon glyphicon-calendar">\
																</span>\
															</span>\
													</div></div>\
													<div class="form-group"><label for="dtp_input3" class="col-md-2 control-label">Every</label>\
													<input type="checkbox" id="checkbox-1"> Monday  <input type="checkbox" id="checkbox-2"> Tuesday \
													<input type="checkbox" id="checkbox-3"> Wednesday\
													</div><div class="form-group"><label for="dtp_input3" class="col-md-2 control-label"></label>\
													<input type="checkbox" id="checkbox-4"> Thursday <input type="checkbox" id="checkbox-5"> Friday  <input type="checkbox" id="checkbox-6"> Sataurday\
													</div>\
													<div class="form-group"><label for="dtp_input3" class="col-md-2 control-label"></label>\
													<input type="checkbox" id="checkbox-7"> Sunday\
													</div><script>$(\'.form_date\').datetimepicker({weekStart: 1,todayBtn:  1,autoclose: 1,todayHighlight: 1,startView: 2,minView: 2,forceParse: 0});</script>',
										closeButton: false,
										buttons: {
											confirm: {
									            label: 'Confirm',
									            className: 'btn-success',
									            callback: function(){
									            	var result = $('#booking-title').val();
									            	if (result) {
														batch_booking();
													}else{
														alert("Please enter a title!");
													}
									            }
									        },
											cancel: {
									            label: 'Cancel',
									            className: 'btn-danger',
									            callback: function(){
									            }
									        }
										}
									});
					            }
					        },
					        cancel: {
					            label: 'Regular Booking',
					            className: 'btn-danger',
					            callback: function(){
					            	var start_show = start.format('YYYY-MM-DD HH:mm');
					            	var end_show = end.format('YYYY-MM-DD HH:mm');
					            	bootbox.dialog({
										title: "Booking confirmation",
										message: '<p>Please provide the following information and click the Confirm button</p><br>\
													<div class="form-group"><label for="dtp_input2" class="col-md-2 control-label">Title: </label>\
													<input class="col-md-5" id="booking-title" size="16" type="text" value=""></div><br><br>\
													<div class="form-group"><label for="dtp_input2" class="col-md-2 control-label">Period: </label>\
													<span id="start-time">'+ start_show +'</span><span id=""> - </span><span id="end-time">'+ end_show +'</span></div><br>',
										closeButton: false,
										buttons: {
											confirm: {
									            label: 'Confirm',
									            className: 'btn-success',
									            callback: function(){
									            	var result = $('#booking-title').val();
									            	if (result) {
														jQuery.ajax({
															url: '/booking',
															type: 'POST',
															data: {
																room_id: room_id,
												                start: start.format(),
												                end: end.format(),
												                title: result,
												                _csrf: csrfToken,
												            },
												            success: function(data) {
												            	data = JSON.parse(data)
												            	if(data.result == "success"){
												            		bootbox.alert('booking success');
													            	var eventData = {
																		title: result,
																		start: start,
																		end: end
																	};
																	//$('#calendar').fullCalendar('renderEvent', eventData, true);
																	$('#calendar').fullCalendar( 'refetchEvents' );
												            	}else{
												            		bootbox.alert("Booking fail with reason: " + data.errMsg);
												            	}
												            	
												            },
														});
													}else{
														alert("Please enter a title!");
													}
									            }
									        },
											cancel: {
									            label: 'Cancel',
									            className: 'btn-danger',
									            callback: function(){
									            }
									        }
										}
									});						
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
				if(!(((Date.parse(moment(event.start).format("YYYY-MM-DD"))) >= (Date.parse(event.rangeStart)))
					&& ((Date.parse(moment(event.end).format("YYYY-MM-DD"))) <= (Date.parse(event.rangeEnd))))){
					return true;
				}else{
					$('#calendar').fullCalendar('unselect');				
		        	return false;
				}				
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
				if(!(((Date.parse(moment(event.start).format("YYYY-MM-DD"))) >= (Date.parse(event.rangeStart)))
					&& ((Date.parse(moment(event.end).format("YYYY-MM-DD"))) <= (Date.parse(event.rangeEnd))))){
					element.remove();
				}
				return ((Date.parse(moment(event.start).format("YYYY-MM-DD"))) >= (Date.parse(event.rangeStart)))
					&& ((Date.parse(moment(event.end).format("YYYY-MM-DD"))) <= (Date.parse(event.rangeEnd)));
			}
		},
		loading: function(bool) {
			$('#loader').toggle(bool);
		}
	});
});

function batch_booking(){
	var startTime = $('#start-time').text();
	var endTime = $('#end-time').text();
	var startDate = $('#startDate').val();
	var endDate = $('#endDate').val();
	var csrfToken = $('#csrfToken').val();
	var roomNumber = $('#calendar').attr('name');
	var dow = "[";
	if($('#checkbox-7').is(":checked")){
		dow += "0,";
	}
	for (var i = 1; i <= 6; i++) {
		if($('#checkbox-' + i ).is(":checked")){
    		dow += "" + i + ",";
    	}
	}
	if(dow.substr(dow.length - 1) == ","){
		dow = dow.substring(0, dow.length-1);
	}
	dow += "]";
	if(dow == "[]"){
		alert("Please select at least one day of the week");
		return;
	}
	if(!startDate || !endDate){
		alert("Please choose the time period");
		return;
	}
	if(Date.parse(startDate) > Date.parse(endDate)){
		alert("End date is later than start date, please check your input");
		return;
	}
	var title = $('#booking-title').val();
	if (title) {
		$('#loader').toggle();
		jQuery.ajax({
			url: '/booking/batch',
			type: 'POST',
			data: {
				room_number: roomNumber,
                start: startTime,
                end: endTime,
                title: title,
                isBatch: 1,
                dow: dow,
                rangeStart: startDate,
                rangeEnd: endDate,
                _csrf: csrfToken,
            },
            success: function(data) {
            	$('#loader').toggle();
            	data = JSON.parse(data)
            	if(data.result == "success"){
            		bootbox.alert('booking success');
					$('#calendar').fullCalendar( 'refetchEvents' );
            	}else{
            		bootbox.alert("Booking fail with reason: " + data.errMsg);	            	
            	}	            	
            },
            error: function(){
            	$('#loader').toggle();
            	bootbox.alert("Unknown error, please refresh or contact admin");
            	window.location.href = "/booking";
            },
		});
	}else{
		alert("Please enter a title!");
	}
}
