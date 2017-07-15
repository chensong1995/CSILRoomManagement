/*
 * Author(s)  : Chen Song
 * Description: The client program for the admin homepage
 * Last Update: July 14, 2017
*/
$(document).ready(function () {
    // create usergroup table
    $('#users_table').DataTable();
    // create privilege table
    $('#privileges_table').DataTable();
    // change usergroup
    $('.usergroup-select').on('change', function() {
        $('#prompt').text('working on that...');
        $.post('/admin/usergroup', { // post the username and usergroup
            id: $(this).data('id'),
            usergroup: $(this).find(":selected").text()
        },
        function () {
            $('#prompt').text('update success');
        }).fail(function (data) {
            $('#prompt').text('update fails');
        });
    });
    // change administrative status
    $('.privilege-select').on('change', function() {
        $('#privileges_prompt').text('working on that...');
        $.post('/admin/allowadmin', { // post the id and allowadmin
            id: $(this).parent().parent().data('id'),
            allowadmin: ($(this).find(":selected").text() == 'Yes')
        },
        function () {
            $('#privileges_prompt').text('update success');
        }).fail(function (data) {
            $('#privileges_prompt').text('update fails');
        });
    });
    // change max bookings
    $('.max-bookings-edit').on('focusout', function() {
        $('#privileges_prompt').text('working on that...');
        $(this).text(parseInt($(this).text()));
        $.post('/admin/maxbookings', { // post the id and maxbookings
            id: $(this).parent().data('id'),
            maxbookings: $(this).text()
        },
        function () {
            $('#privileges_prompt').text('update success');
        }).fail(function (data) {
            $('#privileges_prompt').text('update fails');
        });
    });
    // change description
    $('.description-edit').on('focusout', function() {
        $('#privileges_prompt').text('working on that...');
        $.post('/admin/description', { // post the id and description
            id: $(this).parent().data('id'),
            description: $(this).text()
        },
        function () {
            $('#privileges_prompt').text('update success');
        }).fail(function (data) {
            $('#privileges_prompt').text('update fails');
        });
    });
});