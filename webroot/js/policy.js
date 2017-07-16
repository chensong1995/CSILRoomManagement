/*
 * Author(s)  : Chen Song
 * Description: The client program for policy editing
 * Last Update: July 14, 2017
*/
$(document).ready(function () {
    // init text editor
    tinymce.init({
        selector: '#policy-edit',
        height: 500,
        menubar: false,
        toolbar: 'bold italic underline strikethrough alignleft aligncenter alignright alignjustify styleselect formatselect fontselect fontsizeselect bullist numlist outdent indent blockquote undo redo removeformat subscript superscript'
    });

    // update
    $('#update').on('click', function () {
        $.post('/policy', {
            _csrf: $('#csrfToken').val(),
            content: tinymce.get('policy-edit').getContent()
        }, function () {
            $('#prompt').text('update success');
        }).fail(function (data) {
            $('#prompt').text('update fails');
        });
    });
});