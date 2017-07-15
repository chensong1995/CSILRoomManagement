/*
 * Author(s)  : Chen Song
 * Description: The client program for the admin homepage
 * Last Update: July 14, 2017
*/
$(document).ready(function () {
    // create usergroup table
    $('#users_table').DataTable();

    // change usergroup
    $('.usergroup-select').on('change', function() {
            $('#prompt').text('working on that...');
            $.post('/admin/usergroup', { // post the username and password
                id: $(this).data('id'),
                usergroup: $(this).find(":selected").text()
            },
            function () {
                $('#prompt').text('update success');
            }).fail(function (data) {
                $('#prompt').text('update fails');
            });
    });
});