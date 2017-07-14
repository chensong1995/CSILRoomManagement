/*
 * Author(s)  : Chen Song
 * Description: The client program for the profile page
 * Last Update: July 14, 2017
*/
$(document).ready(function () {
    $('#update-info').on('click', function () {
        $('#prompt').text('processing...');
        var notification = $('#notification').is(':checked') ? 1 : 0;
        $.post("/profile", { // post the notification and biography
            notification: notification,
            biography: $('#biography').val(),
            _csrf: $('#csrfToken').val()
        },
        function () {
            $('#prompt').text('update success');
        }).fail(function () {
            $('#prompt').text('update fails');
        });
    });
});