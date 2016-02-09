"use strict";

class AndonLocalstorage extends Localstorage {
  constructor() {
    let STORAGE_NAME = 'Andon';
    let DEFAULT_KEY_VALUE = {};
    super(STORAGE_NAME, DEFAULT_KEY_VALUE);

    if (this.isInitItem === 1){
      this.saveOptions([]);
      this.saveBrowserActionState(0);
      this.saveUpdateTime(this.nowDatetime());
    }
  }

  get KEY() {
    return {
      options:'options',
      browser_acion_state:'browser_acion_state',
      update_time:'update_time',
    };
  }

  saveOptions(options) {
    this.save(this.KEY.options, options);
  }

  saveBrowserActionState(state) {
    this.save(this.KEY.browser_acion_state, state);
  }

  saveUpdateTime(datetime) {
    this.save(this.KEY.update_time, datetime);
  }

  loadOptions() {
    return this.load(this.KEY.options);
  }

  loadBrowserActionState() {
    return this.load(this.KEY.browser_acion_state);
  }

  loadUpdateTime() {
    return this.load(this.KEY.update_time);
  }

  nowDatetime() {
    return this.formatDate(new Date());
  }

  formatDate(date, format) {
    if (typeof date !== 'object') date = new Date();
    format = format || 'YYYY-MM-DD hh:mm:ss';
    format = format.replace(/YYYY/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    return format;
  }
}
