
function gentleAlert(msg) {
	audioNotification = chrome.runtime.getURL("notification.ogg");
	console.log('hi');

}

document.addEventListener('DOMContentLoaded', function() {
	// your code here
	console.log('hello');

	// it looks like the new google calendar isn't affected by this...
	window.alert = gentleAlert;
 }, false);
