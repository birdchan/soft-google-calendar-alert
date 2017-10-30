
let currentScript = document.currentScript;
let gCalAlertModal = undefined;
let gNotificationAudio = currentScript.dataset.notificationAudio;

function GCalAlertModal() {
	this.queue = [];
	this.modalDomNode = undefined;
}

GCalAlertModal.prototype.receiveMsg = function(msg) {
	this.queue.push(msg);
	console.log('receiveMsg::queue:' + this.queue);
}

GCalAlertModal.prototype.renderModal = function() {
    if (this.modalDomNode) {
		return;  // modal already exists, wait for user to close it first
    }
    let msg = this.queue.shift();
    if (msg === undefined) {
        return;  // nothing to render
	}
	// we have a msg, go render it
	this.createModal(msg);
    this.notify();
    this.registerModalClose();
};

GCalAlertModal.prototype.createModal = function(msg) {
    let span = document.createElement("span");
    span.id = "gentle-alerts-modal";
    span.innerHTML = "\
		<div id=\"gentle-alerts-modal-content\">\
		<p id=\"gentle-alerts-modal-content-text\"></p>\
		</div>";
    document.documentElement.appendChild(span);
	let modalContent = document.getElementById("gentle-alerts-modal-content-text");
	modalContent.textContent = msg;
    this.modalDomNode = document.getElementById("gentle-alerts-modal");
    this.modalDomNode.style.display = "block";
};

GCalAlertModal.prototype.deleteModal = function() {
    if (this.modalDomNode === undefined) {
        return;
    }
    this.modalDomNode.parentNode.removeChild(this.modalDomNode);
    this.modalDomNode = undefined;
};

GCalAlertModal.prototype.notify = function(){
	var audio = new Audio(gNotificationAudio);
	audio.play();
};

GCalAlertModal.prototype.registerModalClose = function() {
    let self = this;
    let originalCallbacks = {};
    function isOnclick(onClickEvent) {
        return onClickEvent.target == self.modalDomNode;
    }
    function isOnKeyUp(onKeyUpEvent) {
		let enterCode = 13;
		let escapeCode = 27;
		let spaceCode = 32;
		let closeModalKeyCodes = [enterCode, escapeCode, spaceCode];
		return closeModalKeyCodes.indexOf(onKeyUpEvent.keyCode) >= 0;
    }
    function overrideEventCallback(verificationFunc, windowEvent) {
        originalCallbacks[windowEvent] = window[windowEvent];  // backup
        window[windowEvent] = function(eventObject) {
			console.log('eventObject: ' + eventObject)
			if (!verificationFunc(eventObject)) {
				return;  // false alarm
			}
            self.deleteModal();
            Object.keys(originalCallbacks).forEach(function (key) {  // restore
                let originalCallback = originalCallbacks[key];
                window[key] = originalCallback;
            });
            self.renderModal();  // in case there are more alerts in the queue
            eventObject.preventDefault();
            return false;
        };
    }
	// When the user clicks anywhere outside of the modal, close it
	overrideEventCallback(isOnclick, "onclick");
    overrideEventCallback(isOnKeyUp, "onkeyup");
};

function gCalAlert(msg) {
	console.log('msg: ' + msg);
	if (gCalAlertModal === undefined) {
		gCalAlertModal = new GCalAlertModal();
	}
	gCalAlertModal.receiveMsg(msg);
	gCalAlertModal.renderModal();
}

window.alert = gCalAlert;
