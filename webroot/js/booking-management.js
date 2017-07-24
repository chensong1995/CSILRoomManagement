/*
 * Author(s)  : Chong, Chen Song
 * Description: The client program for batch booking
 * Last Update: July 22, 2017
*/
$('.info-wrapper').toggle();

$(document).ready(function () {
    $('.form_date').datetimepicker({
        weekStart: 1,
        todayBtn:  1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        minView: 2,
        forceParse: 0
    });
    $('.form_date_time').datetimepicker({
        weekStart: 1,
        todayBtn:  1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        forceParse: 0,
        showMeridian: 1
    });
    // Chong, I fixed the rendering issue on mobile devices here
    $('#batch-record-table').DataTable();
    $('#regular-record-table').DataTable();
    $('.info-wrapper').toggle();
    $('#loader').toggle();

    $('.booking-delete').click(function(){
        var id = $(this).attr("id").split('-')[3];
        var confirm_text = "Do you really want to delete it?";
        if (confirm(confirm_text) == true) {
            jQuery.ajax({
                url: '/admin/booking/' + id,
                type: 'DELETE',
                data: {
                    _csrf: $('#csrfToken').data('token')
                },
                success: function(data) {
                    alert("Successfully delete this booking");
                    location.reload();
                },
                error: function(data) {
                    alert("Fail to delete this booking slot, please try again later");
                },
            });
        }
    });

    $('.batch-booking-modify').click(function(){
        var id = $(this).attr("id").split('-')[3];
        // Check batch booking format.

    });

    $('.regular-booking-modify').click(function(){
        var id = $(this).attr("id").split('-')[3];
        var start = $('#start-date-' + id).val().replace(' ','T');
        var end = $('#end-date-' + id).val().replace(' ','T');
        var room = $('#regular-room-' + id).val();
        if(Date.parse(start) > Date.parse(end)){
            alert("Invalid time, start time should not be later than end time");
        }else{
            var confirm_text = "Do you really want to edit it?";
            if (confirm(confirm_text) == true) {
                jQuery.ajax({
                    url: '/admin/booking/' + id,
                    type: 'PUT',
                    data: {
                        roomname: room,
                        start: start,
                        end: end,
                        _csrf: $('#csrfToken').data('token')
                    },
                    success: function(data) {
                        alert("Successfully edit this booking");
                        location.reload();
                    },
                    error: function(data) {
                        alert("Fail to delete this booking slot, please try again later");
                    },
                });
            }
        }       
    });

    $('.batch-booking-modify').click(function(){
        var id = $(this).attr("id").split('-')[3];
        var rangeStart = $('#start-date-' + id).val().replace(' ','T');
        var rangeEnd = $('#end-date-' + id).val().replace(' ','T');
        var startTime = $('#start-time-' + id).val();
        var endTime = $('#end-time-' + id).val();
        var room = $('#batch-room-' + id).val();

        var dow = "[";
        if($('#checkbox-7-' + id).is(":checked")){
            dow += "0,";
        }
        for (var i = 1; i <= 6; i++) {
            if($('#checkbox-' + i + '-' + id).is(":checked")){
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

        if(Date.parse(rangeStart) > Date.parse(rangeEnd)){
            alert("Invalid date period, start date should not be later than end date");
        }else{
            if(!isTimeValid(startTime, endTime)){
                alert("Invalid time, please use a format of 00:00. Also 24-hour clock is used.");
            }else{
                var confirm_text = "Do you really want to edit it?";
                if (confirm(confirm_text) == true) {
                    jQuery.ajax({
                        url: '/admin/booking/' + id,
                        type: 'PUT',
                        data: {
                            roomname: room,
                            start: startTime,
                            end: endTime,
                            rangeStart: rangeStart,
                            rangeEnd: rangeEnd,
                            dow: dow,
                            _csrf: $('#csrfToken').data('token')
                        },
                        success: function(data) {
                            alert("Successfully edit this booking");
                            location.reload();
                        },
                        error: function(data) {
                            alert("Fail to edit this booking slot, please try again later");
                        },
                    });
                }
            }
        }       
    });
});

function isTimeValid(start, end){
    if(start.length != 5 || end.length !=5){
        return false;
    }
    if(start.substring(2,3) != ":" || end.substring(2,3) != ":"){
        return false;
    }
    if(parseInt(start.substring(0,2)) > 23 || parseInt(start.substring(0,2)) < 0){
        return false;
    }
    if(parseInt(end.substring(0,2)) > 23 || parseInt(end.substring(0,2)) < 0){
        return false;
    }
    if(parseInt(start.substring(3,5)) > 59 || parseInt(start.substring(3,5)) < 0){
        return false;
    }
    if(parseInt(end.substring(3,5)) > 59 || parseInt(end.substring(3,5)) < 0){
        return false;
    }
    if(parseInt(start.substring(0,2)) > parseInt(end.substring(0,2))){
        return false;
    }else if((parseInt(start.substring(0,2)) == parseInt(end.substring(0,2)))
        &&(parseInt(start.substring(3,5)) >= parseInt(end.substring(3,5)))){
        return false;
    }
    return true;
}