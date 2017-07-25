/*
 * Author(s)  : Chong, Chen Song
 * Description: The client program for batch booking
 * Last Update: July 22, 2017
*/
$('.info-wrapper').toggle();

$(document).ready(function () {
    $('#batch-record-table').DataTable();
    $('#regular-record-table').DataTable();
    $('.info-wrapper').toggle();
    $('#loader').toggle();

    $('.booking-delete').click(function(){
        var id = $(this).attr("id").split('-')[3];
        var confirm_text = "Do you really want to delete it?";
        if (confirm(confirm_text) == true) {
            jQuery.ajax({
                url: '/user/events/' + id,
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
});
