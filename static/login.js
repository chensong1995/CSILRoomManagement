/*
 * Author(s)  : Chen Song
 * Description: This is a test for the login service
 * Last Update: July 8, 2017
*/
$(document).ready(function () {
	$('#cas').on('click', function () {
		var currentUrl = $(location).attr('href');
		var casUrl = 'https://cas.sfu.ca/cas/login?service=';
		$(location).attr('href', encodeURI(casUrl + currentUrl));
	});
});