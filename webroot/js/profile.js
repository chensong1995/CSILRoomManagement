/*
 * Author(s)  : Chen Song
 * Description: The client program for the profile page
 * Last Update: July 13, 2017
*/
$(document).ready(function () {
    $('#update-info').on('click', function () {
        $.post("/profile", { // post the username and password
            biography: $("#biography").val(),
            _csrf: $("#csrfToken").val()
        },
        function () {
            $('#prompt').text('update success');
        }).fail(function () {
            var prompt = 'update fails';
            $('#prompt').text(prompt);
        });
    });
});