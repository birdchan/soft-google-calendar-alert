// Install Javascript
var s = document.createElement("script");
s.src = chrome.runtime.getURL("js/gcal-alert.js");
s.dataset.notificationAudio = chrome.runtime.getURL("sound-notification.ogg");
s.dataset.bellIcon = chrome.runtime.getURL("icons/icon-bell.svg");
document.head.appendChild(s);

// Install CSS
var c = document.createElement("link");
c.rel = "stylesheet";
c.href = chrome.runtime.getURL("css/gcal-alert.css");
document.head.appendChild(c);
