/*
 * Author(s)  : Chen Song
 * Description: The client program for announcement creation/editing
 * Last Update: July 14, 2017
*/
$(document).ready(function () {
    // init text editor
    tinymce.init({
        selector: '#announcement-edit',
        height: 500,
        menubar: false,
        plugins: "link",
        toolbar: 'bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styleselect formatselect | fontselect fontsizeselect | link | bullist numlist | outdent indent blockquote | undo redo | removeformat subscript superscript'
    });

    // create
    $('#create').on('click', function () {
        $('#prompt').text('working on that...');
        if ($('#title').val() == '') {
            $('#prompt').text('Please fill out the title');
        } else {
            $.post('/announcement/new', {
                _csrf: $('#csrfToken').val(),
                title: $('#title').val(),
                content: tinymce.get('announcement-edit').getContent()
            }, function () {
                $(location).attr('href', '/announcement?message=You%20have%20successfully%20created%20a%20new%20announcement');
            }).fail(function (data) {
                $('#prompt').text('creation fails, this is normally because there is already an announcement with the same title in the database');
            });
        }
    });

    // update
    $('#update').on('click', function () {
        $('#prompt').text('working on that...');
        $.post($(location).attr('href'), {
            _csrf: $('#csrfToken').val(),
            content: tinymce.get('announcement-edit').getContent()
        }, function () {
            $(location).attr('href', '/announcement?message=You%20have%20successfully%20updated%20this%20announcement');
        }).fail(function (data) {
            $('#prompt').text('update fails');
        });
    });
});