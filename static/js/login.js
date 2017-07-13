/*
 * Author(s)  : Chen Song
 * Description: This is a test for the login service
 * Last Update: July 8, 2017
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
        if ($("#username").val() != '' && $("#password").val() != '') {
            $.post("/login", { // post the username and password
                username: $("#username").val(),
                password: $("#password").val()
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

    // user wants to signup
    $('#signup').on('click', function () {
        if ($('#username-signup').val() == '') {
            $('#prompt-signup').text('username is empty');
        } else if ($('#password-signup').val() == '') {
            $('#prompt-signup').text('password is empty');
        } else if ($('#password-signup-confirm').val() == '') {
            $('#prompt-signup').text('password confirmation is empty');
        } else if ($('#password-signup').val() != $('#password-signup-confirm').val()) {
            $('#prompt-signup').text('passwords do not match');
        } else if ($('#email-signup').val() == '') {
            $('#prompt-signup').text('email is empty');
        } else { // inputs are valid
            $.post("/signup", { // post the username and password
                username: $("#username-signup").val(),
                password: $("#password-signup").val(),
                email: $("#email-signup").val()
            },
            function () {
                $('#prompt-signup').text('signup success');
                if ($.url('?redirect')) {
                    $(location).attr('href', $.url('?redirect'));
                } else {
                    $(location).attr('href', '/');
                }
            }).fail(function (data) {
                var status = data.status;
                var prompt = 'unknown error';
                if (status == 403) {
                    prompt = 'username already exists';
                } 
                $('#prompt-signup').text(prompt);
            });
        }
    });
});