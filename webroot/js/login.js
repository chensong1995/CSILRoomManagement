/*
 * Author(s)  : Chen Song
 * Description: The client program for the login service
 * Last Update: July 14, 2017
*/
$(document).ready(function () {
    // user wants to use the SFU CAS
    $('#cas').on('click', function () {
        var currentUrl = $(location).attr('href');
        var casUrl = 'https://cas.sfu.ca/cas/login?service=';
        $(location).attr('href', encodeURI(casUrl + currentUrl));
    });

    // user wants to use our own service
    $('#login').on('click', function () {
        if ($('#username').val() != '' && $('#password').val() != '') {
            $.post('/login', { // post the username and password
                username: $('#username').val(),
                password: $('#password').val()
            },
            function () {
                $('#prompt').text('login success');
                if ($.url('?redirect')) {
                    $(location).attr('href', $.url('?redirect'));
                } else {
                    $(location).attr('href', '/');
                }
            }).fail(function (data) {
                var status = data.status;
                var prompt = 'unknown error';
                if (status == 403) {
                    prompt = 'invalid username or password';
                } else if (status == 500) {
                    prompt = 'server error';
                }
                $('#prompt').text(prompt);
            });
        } else {
            $('#prompt').text('username or password is empty');
        }
    });

    // user clicks the signup button
    $('#signup').click(function(){
        $('#myModal').modal('show'); // display the dialog
    });



    // The user enters the username in the signup dialog
    $('#username-signup').on('input', function() {
        var msgId = 'username-signup-msg';
        var iconId = 'username-icon';
        var errMsgClass = 'username-err-msg';
        if ($('#username-signup').val() != '') { // username is not empty

            $.post('/signup/check-username', { // check if username is valid
              username: $('#username-signup').val()
            },
            function(data, status) { // username is valid

                // create an icon and add it to the username textbox
                $('#' + msgId).attr('class', 'has-feedback has-success');
                var icon = createIconWithId(true, iconId);
                $('#' + msgId).append(icon);

                // remove all err messages related to username
                $('.' + errMsgClass).remove();
            }).fail(function(data, status) { // username is invalid

                // create an icon and add it to the username textbox
                $('#' + msgId).attr('class', 'has-feedback has-error');
                var icon = createIconWithId(false, iconId);
                $('#' + msgId).append(icon);

                // remove all err messages related to username
                $('.' + errMsgClass).remove();
                // create an error message
                createErrMsg('username already exists', errMsgClass);
            });
        } else { // username is empty
            // clear the icon and color
            $('#' + iconId).remove();
            $('#' + msgId).attr('class', '');
        }
    });
    // user enters the password
    $('#password-signup').on('input', function() {

        var msgClass = 'password-signup-msg';
        var iconClass = 'password-icon';
        var errMsgClass = 'password-err-msg';
        if ($('#password-signup').val() != '' && $('#password-signup-confirm').val() != '') {
            if ($('#password-signup').val() != $('#password-signup-confirm').val()) { // password and confirm do not match

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
    $('#password-signup-confirm').on('input', function() {

        var msgClass = 'password-signup-msg';
        var iconClass = 'password-icon';
        var errMsgClass = 'password-err-msg';

        if ($('#password-signup').val() != '' && $('#password-signup-confirm').val() != '') {
            if ($('#password-signup').val() == $('#password-signup-confirm').val()) { // password and confirm match

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


    // The user enters the email in the signup dialog
    $('#email-signup').on('input', function() {
        var msgId = 'email-signup-msg';
        var iconId = 'email-icon';
        var errMsgClass = 'email-err-msg';

        if (!validateEmail($('#email-signup').val())) {
            // create an icon and add it to the password textbox
            $('#' + msgId).attr('class', 'has-feedback has-error');
            var icon = createIconWithId(false, iconId);
            $('#' + msgId).append(icon);

            // remove all err messages related to email
            $('.' + errMsgClass).remove();
            // create an error message
            createErrMsg('Invalid email address', errMsgClass);
        } else { // email is good
            // create an icon and add it to the email textbox
            $('#' + msgId).attr('class', 'has-feedback has-success');
            var icon = createIconWithId(true, iconId);
            $('#' + msgId).append(icon);

            // remove all err messages related to email
            $('.' + errMsgClass).remove();
        }
    });

    // The user clicks the signup confirm button
    $('#signup-confirm').click(function(){
        if ($('#password-signup').val() == $('#password-signup-confirm').val() && $('#password-signup').val() != '' && $('#username-signup').val() != '' && $('#email-signup').val() != '') { // password and confirm match
            $.post('/signup', { // post the username and password
                username: $('#username-signup').val(),
                password: $('#password-signup').val(),
                email: $('#email-signup').val()
            },
            function () {
                if ($.url('?redirect')) {
                    $(location).attr('href', $.url('?redirect'));
                } else {
                    $(location).attr('href', '/');
                }
            }).fail(function (data) {
                var errMsgClass = 'server-err-msg';
                // remove all err messages related to server
                $('.' + errMsgClass).remove();
                // create an error message
                createErrMsg('Failed to signup', errMsgClass);
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

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}