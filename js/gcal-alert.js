
let currentScript = document.currentScript;
let gCalAlertModal = undefined;
let gNotificationAudio = currentScript.dataset.notificationAudio;
let gBellIcon = currentScript.dataset.bellIcon;

function GCalAlertModal() {
	this.queue = [];
	this.modalDomNode = undefined;
}

GCalAlertModal.prototype.receiveMsg = function(msg) {
	this.queue.push(msg);
}

GCalAlertModal.prototype.renderModal = function() {
    if (this.modalDomNode) {
        this.renderMoreText();
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
    let modal = document.createElement("span");
    modal.id = "soft-alerts-modal";
    modal.innerHTML = '\
		<div class=\"content\">\
            <image class="icon" />\
            <p class="text"></p>\
            <p class="more"></p>\
            <p class="dismiss_container"><span class="dismiss">Dismiss</span></p>\
            </div>';
    document.documentElement.appendChild(modal);
    let icon = modal.querySelector('.icon');
    icon.src = gBellIcon;
	let modalContent = modal.querySelector(".text");
	modalContent.textContent = msg;
    this.modalDomNode = document.getElementById("soft-alerts-modal");
    this.modalDomNode.style.display = "block";
    this.renderMoreText();
};

GCalAlertModal.prototype.renderMoreText = function() {
    let numOfMsg = this.queue.length;
    if (numOfMsg > 0) {
        let moreNode = this.modalDomNode.querySelector(".more");
        let text = undefined;
        if (numOfMsg == 1) {
            text = numOfMsg + " more alert";
        } else {
            text = numOfMsg + " more alerts";
        }
        moreNode.textContent = text;
    }
};

GCalAlertModal.prototype.deleteModal = function() {
    if (this.modalDomNode === undefined) {
        return;
    }
    this.modalDomNode.parentNode.removeChild(this.modalDomNode);
    this.modalDomNode = undefined;
};

GCalAlertModal.prototype.notify = function(){
	let audio = new Audio(gNotificationAudio);
	audio.play();
};

GCalAlertModal.prototype.registerModalClose = function() {
    let self = this;
    let originalCallbacks = {};
    function isOnclick(onClickEvent) {
        let dismiss_btn = self.modalDomNode.querySelector('.dismiss');
        return (onClickEvent.target == self.modalDomNode ||  // the blurred area
            onClickEvent.target == dismiss_btn);
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
	if (gCalAlertModal === undefined) {
		gCalAlertModal = new GCalAlertModal();
	}
	gCalAlertModal.receiveMsg(msg);
	gCalAlertModal.renderModal();
}

window.alert = gCalAlert;
