/*
 * Author(s)  : Chen Song
 * Description: The client program for navbar
 * Last Update: July 22, 2017
*/

$(document).ready(function () {
    /*
     * Author(s)  : Chen Song
     * Description: Initialize multi-level dropdown
     * Last Update: July 22, 2017
    */
    $('#side-menu').metisMenu();
    /*
     * Author(s)  : Chen Song
     * Description: The client program for changing password
     * Last Update: July 14, 2017
    */
    $('#password').on('click', function () {
        $('#old-password').val('');
        $('#passwordModal').modal('show'); // display the dialog
    });
    // user enters the new password
    $('#new-password').on('input', function() {
        var msgClass = 'new-password-msg';
        var iconClass = 'new-password-icon';
        var errMsgClass = 'new-password-err-msg';
        if ($('#new-password').val() != '' && $('#confirm-new-password').val() != '') {
            if ($('#new-password').val() != $('#confirm-new-password').val()) { // password and confirm do not match

                // create an icon and add it to the password textbox
                $('.' + msgClass).attr('class', 'has-feedback has-error ' + msgClass);
                var icon = createIconWithClass(false, iconClass);
                $('.' + msgClass).append(icon);

                // remove all err messages related to password
                $('.' + errMsgClass).remove();
                // create an error message
                createErrMsg('Password does not match', errMsgClass);
            } else {
                // create an icon and add it to the password textbox
                $('.' + msgClass).attr('class', 'has-feedback has-success ' + msgClass);
                var icon = createIconWithClass(true, iconClass);
                $('.' + msgClass).append(icon);

                // remove all err messages related to password
                $('.' + errMsgClass).remove();
            }
        } else {
            $('.' + msgClass).attr('class', msgClass);
            $('.' + iconClass).remove();
        }
    });
    // The user enters the password confirm
    $('#confirm-new-password').on('input', function() {
        var msgClass = 'new-password-msg';
        var iconClass = 'new-password-icon';
        var errMsgClass = 'new-password-err-msg';
        if ($('#new-password').val() != '' && $('#confirm-new-password').val() != '') {
            if ($('#new-password').val() == $('#confirm-new-password').val()) { // password and confirm match
                // create an icon and add it to the password textbox
                $('.' + msgClass).attr('class', 'has-feedback has-success ' + msgClass);
                var icon = createIconWithClass(true, iconClass);
                $('.' + msgClass).append(icon);

                // remove all err messages related to password
                $('.' + errMsgClass).remove();
            } else {
                // create an icon and add it to the password textbox
                $('.' + msgClass).attr('class', 'has-feedback has-error ' + msgClass);
                var icon = createIconWithClass(false, iconClass);
                $('.' + msgClass).append(icon);

                // remove all err messages related to password
                $('.' + errMsgClass).remove();
                // create an error message
                createErrMsg('Password does not match', errMsgClass);
            }
        } else {
            $('.' + msgClass).attr('class', msgClass);
            $('.' + iconClass).remove();
        }
    });
    // The user clicks the change password button
    $('#change-password-confirm').click(function() {
        var msgId = 'old-password-msg';
        var iconId = 'old-password-icon';
        var errMsgClass = 'old-password-err-msg';
        if ($('#new-password').val() == $('#confirm-new-password').val() && $('#new-password').val() != '' && $('#old-password').val() != '') { // password and confirm match
            // remove all existing related err messages
            $('.' + errMsgClass).remove();
            $.post('/password', { // post the oldpassword and newpassword
                oldpassword: $('#old-password').val(),
                newpassword: $('#new-password').val()
            },
            function () {
                createSuccessMsg('password is updated', errMsgClass);
            }).fail(function () {
                // create an error message
                createErrMsg('Failed to update your password. Please make sure your old password is correct.', errMsgClass);
            });
        }
    });
});

function createIconWithId(success, id) {
    $('#' + id).remove();
    var icon = document.createElement('span');
    if (success) {
        icon.setAttribute('class', 'glyphicon glyphicon-ok form-control-feedback');
        icon.setAttribute('id', id);
    } else {
        icon.setAttribute('class', 'glyphicon glyphicon-remove form-control-feedback');
        icon.setAttribute('id', id);
    }
    return icon;
}

function createIconWithClass(success, className) {
    $('.' + className).remove();
    var icon = document.createElement('span');
    if (success) {
        icon.setAttribute('class', 'glyphicon glyphicon-ok form-control-feedback ' + className);
    } else {
        icon.setAttribute('class', 'glyphicon glyphicon-remove form-control-feedback ' + className);
    }
    return icon;
}

function createErrMsg(text, className) {
    var div = document.createElement('div');
    div.setAttribute('class', 'alert alert-danger alert-dismissable ' + className);

    var t = document.createTextNode(text);
    div.appendChild(t);

    var a = document.createElement('a');
    a.setAttribute('href', '#');
    a.setAttribute('data-dismiss', 'alert');
    a.setAttribute('aria-label', 'close');
    a.innerHTML = '&times;';
    div.appendChild(a);

    $('.modal-body').prepend(div);
}

function createSuccessMsg(text, className) {
    var div = document.createElement('div');
    div.setAttribute('class', 'alert alert-success alert-dismissable ' + className);

    var t = document.createTextNode(text);
    div.appendChild(t);

    var a = document.createElement('a');
    a.setAttribute('href', '#');
    a.setAttribute('data-dismiss', 'alert');
    a.setAttribute('aria-label', 'close');
    a.innerHTML = '&times;';
    div.appendChild(a);

    $('.modal-body').prepend(div);
}