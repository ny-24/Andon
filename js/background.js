"use strict";

class Background {
  constructor() {
    this.m = new BackgroundModel();
    this.v = new BackgroundView(this.m);
    this.addEvents();
  }

  addEvents() {
    this.m.eventDispatcher.browserAction((tab) => {
      this.browserAction();
    });
    this.m.eventDispatcher.addEventListener((request, sender, sendResponse) => {
      let event = this.m.eventDispatcher.EVENT;
      switch(request.eventName) {
      case event.UPDATE_ANDON:
        this.m.dispatchEventUpdateWindow();
        break;
      }
    });
  }

  browserAction() {
    this.m.toggleBrowserActionState();
    this.m.dispatchEventUpdateWindow();
    this.v.updateBrowserActionIcon();
  }
}

class BackgroundModel {
  constructor() {
    this.IMAGE_PATH = {
      browserActionOn:"images/icon048_on.png",
      browserActionOff:"images/icon048_off.png",
    };
    this.eventDispatcher = new AndonEventDispatcher();
    this.localstorage = new AndonLocalstorage();
    this.browserActionState = this.localstorage.loadBrowserActionState();
  }

  toggleBrowserActionState() {
    let state = this.localstorage.loadBrowserActionState();
    let setValue = (state === 1) ? 0 : 1;
    this.localstorage.saveBrowserActionState(setValue);
    this.browserActionState = setValue;
  }

  loadOptions() {
    return this.localstorage.loadOptions();
  }

  dispatchEventUpdateWindow() {
    let options = this.loadOptions();
    let state = this.browserActionState;
    this.eventDispatcher.getAllTabsOfAllWindows((tab) => {
      if (state === 1) {
        let match = this.matchOption(tab.url, options);
        if (match.isMatch === 1) {
          this.dispatchEventShowAndon(tab, match.option);
        }else{
          this.dispatchEventHideAndon(tab);
        }
      }else{
        this.dispatchEventHideAndon(tab);
      }
    });
  }

  dispatchEventShowAndon(tab, option) {
    this.eventDispatcher.dispatchEventShowAndonToTab(tab.id, option, function(response){
    });
  }

  dispatchEventHideAndon(tab) {
    this.eventDispatcher.dispatchEventHideAndonToTab(tab.id, function(response){
    });
  }

  onBrowserActionButton() {
    if (this.browserActionState === 1) {
      return true;
    }else{
      return false;
    }
  }

  matchOption(url, options) {
    if (options === undefined || options.length === 0) return 0;
    let len = options.length;
    let match = {isMatch:0, option:{}};

    for (let i = 0; i < len; i++) {
      let option = options[i];
      let pattern = option["url_pattern"];
      if (option["is_regexp"] === 0) {
        if (pattern.length >= 1 && url.indexOf(pattern) >= 0) {
          match.isMatch = 1;
          match.option = option;
          return match;
        }
      }else{
        if (pattern.length >= 1){
          let regexp = new RegExp(pattern, "i");
          if (regexp.test(url)) {
            match.isMatch = 1;
            match.option = option;
            return match;
          }
        }
      }
    }
    return match;
  }
}

class BackgroundView {
  constructor(model) {
    this.m = model;
    this.updateBrowserActionIcon();
  }

  updateBrowserActionIcon() {
    let path = this.m.browserActionState === 1 ? 
      this.m.IMAGE_PATH.browserActionOn : this.m.IMAGE_PATH.browserActionOff;
    this.m.eventDispatcher.setIcon(path);
  }
}

(function () {
  let background = new Background();
}());


