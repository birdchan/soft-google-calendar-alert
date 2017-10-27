
var currentScript = document.currentScript;

function gentleAlert(msg) {
	audioNotification = currentScript.dataset.audioNotification;
	console.log('hi: ' + msg);

}

window.alert = gentleAlert;
