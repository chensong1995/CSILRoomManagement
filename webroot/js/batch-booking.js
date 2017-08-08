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
	            		window.location.href = "/booking";
	            	}else{
	            		alert("Booking fail with reason: " + data.errMsg);	            	
	            	}	            	
	            },
	            error: function(){
	            	$('#loader').toggle();
	            	alert("Unknown error, please refresh or contact admin");
	            	window.location.href = "/booking";
	            },
			});
		}else{
			alert("Please enter a title!");
		}
    });
});