"use strict";

class Localstorage {
  constructor(storageName, defaultValue) {
    if (!storageName) return;
    defaultValue = defaultValue || {};
    this.storageName = storageName;
    this.isInitItem = this.initItem(defaultValue);
  }

  initItem(defaultValue) {
    let item = this.getItem_();
    if (item === undefined) {
      this.setItem_(defaultValue);
      return 1;
    }
    return 0;
  }

  save(key, value) {
    let item = this.getItem_();
    item[key] = value;
    this.setItem_(item);
  }

  load(key) {
    let item = this.getItem_();
    if (item === undefined) return undefined;
    return item[key];
  }

  clear() {
    localStorage.clear();
  }

  getItem_() {
    let itemJson = localStorage.getItem(this.storageName);
    if (itemJson) {
      return JSON.parse(itemJson);
    }else{
      return undefined;
    }
  }

  setItem_(value) {
    let valueJson = JSON.stringify(value);
    localStorage.setItem(this.storageName, valueJson);
  }
}
