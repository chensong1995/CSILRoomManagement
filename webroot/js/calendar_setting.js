$(document).ready(function() {
	jQuery.ajax({
		url: '/user/icalkey',
		type: 'GET',
        success: function(data) {
        	data = JSON.parse(data)
        	if(data.result == "success"){
        		var ckey = data.key;
        		$('#calendar_feed').text(window.location.host + "/icalfeed/" + ckey);
        	}       	
        },
        error: function(data) {
        	alert("Unknown error occurs");     	
        }
	});
});