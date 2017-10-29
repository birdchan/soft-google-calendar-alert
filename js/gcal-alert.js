
let currentScript = document.currentScript;
let gCalAlertModal = undefined;
let notificationAudio = currentScript.dataset.notificationAudio;

function GCalAlertModal() {
	this.queue = [];
	this.modalDomNode = undefined;
}

GCalAlertModal.prototype.queueMsg = function(msg) {
	this.queue.push(msg);
	console.log('queueMsg::queue:' + this.queue);
}

function gCalAlert(msg) {
	audioNotification = currentScript.dataset.audioNotification;
	console.log('msg: ' + msg);
	if (gCalAlertModal === undefined) {
		gCalAlertModal = new GCalAlertModal();
	}
	gCalAlertModal.queueMsg(msg);
}

window.alert = gCalAlert;
