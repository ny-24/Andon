"use strict";

class AndonEventDispatcher extends ChromeAPI{
  constructor() {
    super();
  }

  get EVENT() {
    return {
      UPDATE_ANDON: "eventUpdateAndon",
      SHOW_ANDON: "eventShowAndon",
      HIDE_ANDON: "eventHideAndon",
    };
  }

  dispatchEventUpdateAndon(data) {
    this.dispatchEvent_(this.EVENT.UPDATE_ANDON, data);
  }

  dispatchEventShowAndonToTab(tabId, option, callback) {
    this.dispatchEventToTab_(tabId, this.EVENT.SHOW_ANDON, option, callback);
  }

  dispatchEventHideAndonToTab(tabId, callback) {
    this.dispatchEventToTab_(tabId, this.EVENT.HIDE_ANDON, {}, callback);
  }

  dispatchEventToTab_(tabId, eventName, option, callback) {
    let eventObject = {
      eventName: eventName,
      option:option
    };
    this.dispatchEventToTabs(tabId, eventObject, callback);
  }


  dispatchEvent_(eventName, data) {
    let eventObject = {
      eventName:eventName,
    };
    this.merge(eventObject, data);
    this.dispatchEvent(eventObject);
  }

  merge(a, b) {
    if (!a) return;
    if (typeof a !=="object") return;
    if (!b) {
      b = {};
    }
    if (typeof b !=="object") return;

    for (let attrname in b) {
      if (b.hasOwnProperty(attrname) && !a.hasOwnProperty(attrname)) {
        a[attrname] = b[attrname];
      }
    }
  }
}
