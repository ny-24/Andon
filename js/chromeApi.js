"use strict";

class ChromeAPI {
  constructor() {

  }

  dispatchEvent(eventObject, callback){
    chrome.runtime.sendMessage(eventObject, function(response) {
      if (callback) callback(response);
    });
  }

  dispatchEventToTabs(tabId, eventObject, callback) {
    chrome.tabs.sendMessage(tabId, eventObject, function(response) {
      if (callback) callback(response);
    });
  }

  addEventListener(callback) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
      if (callback) callback(request, sender, sendResponse);
    });
  }

  browserAction(callback) {
    chrome.browserAction.onClicked.addListener(function(tab) {
      if (callback) callback(tab);
    });
  }

  getAllTabsOfAllWindows(callback) {
    chrome.windows.getAll({"populate" : true}, (windows) => {
      if (!windows) return;

      let len = windows.length;
      for (let i = 0; i < len; i++) {
        let windowObject = windows[i];
        this.getAllTabs(windowObject, callback);
      }
    });
  }

  getAllTabs(windowObject, callback) {
    if (!windowObject) return;
    let tabs = windowObject.tabs;
    let len = tabs.length;
    for (let i = 0; i < len; i++) {
      if (callback) callback(tabs[i]);
    }
  }

  setIcon(path) {
    chrome.browserAction.setIcon({path:path});
  }
}