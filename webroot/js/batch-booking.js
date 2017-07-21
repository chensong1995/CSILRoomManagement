/*
 * Author(s)  : Chong
 * Description: The client program for batch booking
 * Last Update: July 20, 2017
*/
$('.info-wrapper').toggle();

$(document).ready(function () {
	$('.form_date').datetimepicker({
        //language:  'fr',
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
    });
    $('.info-wrapper').toggle();
    $('#loader').toggle();
    $('#batch-record-table').DataTable();
    $('#batch-booking-confirm').click(function(){
    	var startTime = $('#start-time').text();
    	var endTime = $('#end-time').text();
    	var startDate = $('#startDate').val();
    	var endDate = $('#endDate').val();
    	var csrfToken = $('#csrfToken').val();
    	var roomNumber = $('#room-number').text();
    	var dow = "[";
    	if($('#checkbox-1').is(":checked")){
    		dow += "1";
    	}
    	for (var i = 2; i <= 7; i++) {
    		if($('#checkbox-' + 'i' ).is(":checked")){
	    		dow += "," + i;
	    	}
    	}
    	dow += "]";
    	if(dow == "[]"){
    		alert("Please select at least one day of the week");
    	}
    	if(!startDate || !endDate){
    		alert("Please choose the time period");
    	}
    	var title = prompt('Enter your event Title:');
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
	            		alert('booking success');
						$('#calendar').fullCalendar('renderEvent', eventData, true);
	            	}else{
	            		alert("Booking fail with reason: " + data.errMsg);	            	
	            	}	            	
	            },
	            error: function(){
	            	$('#loader').toggle();
	            	alert("Unknown error, please refresh or contact admin");
	            },
			});
		}else{
			alert("Please enter a title!");
		}
    });
});