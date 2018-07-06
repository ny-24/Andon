"use strict";

class Option {
  constructor() {
    this.m = new OptionModel();
    this.v = new OptionView(this.m);
    this.addEvents();
    this.v.updateStateDeleteButton();
    this.v.updateLatestUpdateTime();
  }

  addEvents() {
    $("#add-button").on("click", (e) => {
      this.addItem_();
    });
    $("#save-button").on("click", (e) => {
      this.save_();
    });
    $("#item-list").on("click", "button.delete-button", (e) => {
      this.removeItem_(e.target);
    });
    $("#item-list").on("click keyup keyup change", "input", (e) => {
      this.showColorPreview_(e.target);
    });
    $("#item-list").on("blur", "input", (e) => {
      this.hideColorPreview_(e.target);
    });
    $("#menu").on("change", "#files", (e) => {
      this.importOptionFile(e.target.files);
    });
    $("#export-file-button").on(("click"), (e) => {
      this.exportOptionFile(e);
    });

    $("#item-list").sortable({
      cursor: "move",
      opacity: 0.7,
      placeholder: "ui-state-highlight",
      axis: "y"
    });
    $("#item-list").disableSelection();
  }

  addItem_() {
    this.m.itemCount++;
    this.v.addItem(true, true);
    this.v.updateStateDeleteButton();
  }

  save_() {
    this.m.save();
    this.m.updateAndon();
    this.v.updateLatestUpdateTime(true);
  }

  removeItem_(sender) {
    this.v.disableButtons(true);
    this.m.itemCount--;
    this.v.removeItem(sender, () => {
      this.v.disableButtons(false);
      this.v.updateStateDeleteButton();
    });
  }

  showColorPreview_(sender) {
    this.v.showColorPreview(sender);
  }

  hideColorPreview_(sender) {
    this.v.hideColorPreview(sender);
  }

  importOptionFile(files) {
    this.v.disableButtons(true);
    this.m.loadFile(files, (error, options) => {
      if (error === 0){
        this.v.initOption(options, true);
      }
      this.v.disableButtons(false);
      this.v.resetFileInput();
    });
  }

  exportOptionFile(sender) {
    this.v.disableButtons(true);
    this.m.exportOptions();
    this.v.downloadExportOptionFile();
    this.v.disableButtons(false);
  }
}

class OptionModel {
  constructor() {
    this.localstorage = new AndonLocalstorage();
    this.eventDispatcher = new AndonEventDispatcher();
    this.itemHtml = undefined;
    this.$itemList = undefined;
    this.itemCount = 1;
    this.downloadUrl = undefined;
  }

  loadFile(files, callback) {
    let file = files[0];
    if (!file) return;
    if (!file.type.indexOf("json") < 0 ) {
      if (callback) callback(1, []);
      return;
    }

    let reader = new FileReader();
    reader.onloadend = (evt) => {
      if (!reader.result) {
        if (callback) callback(1, []);
        return;
      }

      try {
        let option = JSON.parse(reader.result);
        if (callback){
          if (option["options"]) {
            callback(0, option["options"]);
          }else{
            callback(1, []);
          }
        }
      }
      catch (e) {
        if (callback) callback(1, []);
      }
    };
    reader.readAsText(file);
  }

  updateAndon() {
    this.eventDispatcher.dispatchEventUpdateAndon();
  }

  save() {
    this.saveOption();
    this.saveUpdateTime();
  }

  saveUpdateTime() {
    this.localstorage.saveUpdateTime(this.localstorage.nowDatetime());
  }

  saveOption() {
    let saveData = [];
    let isSave = false;
    this.$itemList.find("li").each(function(){
      let $list = $(this);
      let isRegexp = $list.find(".use-regexp").prop("checked") ? 1 : 0;
      let urlPattern = $list.find(".url-pattern").val();
      let backgroundColor = $list.find(".background-color").val();
      let text = $list.find(".text").val();
      let textColor = $list.find(".text-color").val();

      isSave = true;
      saveData.push({
        is_regexp:isRegexp,
        url_pattern:urlPattern,
        background_color:backgroundColor,
        text:text,
        text_color:textColor
      });
    });

    if (isSave) {
      this.localstorage.saveOptions(saveData);
    }
  }

  loadOptions() {
    return this.localstorage.loadOptions();
  }

  updateTime() {
    return this.localstorage.loadUpdateTime();
  }

  exportOptions() {
    this.downloadUrl = undefined;
    let options = this.loadOptions();
    let optionsHash = {"options":options};
    let optionsJson = JSON.stringify(optionsHash);
    optionsJson = optionsJson.replace(/{/g, "\n{\n");
    optionsJson = optionsJson.replace(/}/g, "\n}\n");
    let blob = new Blob([optionsJson], { "type" : "text/plain"});
    window.URL = window.URL || window.webkitURL;
    this.downloadUrl = window.URL.createObjectURL(blob);
  }
}


class OptionView{
  constructor(m) {
    this.m = m;
    this.m.$itemList = $("#item-list");
    this.m.itemHtml = this.itemHtml_();
    this.initOption(this.m.loadOptions(), false);
  }

  initOption(options, isBindeColor) {
    if (options === undefined || options.length === 0) return;
    let len = options.length;

    if (len > 0) {
      this.m.$itemList.find("li").remove();
      for (let i = 0; i < len; i++) {
        let item = options[len - i -1];
        this.addItem(false, isBindeColor, item["background_color"], item["text_color"]);
      }
    }

    let count = 0;
    this.m.$itemList.find("li").each(function(){
      let $list = $(this);
      let item = options[count];
      if (item["is_regexp"] === 1) $list.find(".use-regexp").prop("checked", true);
      $list.find(".url-pattern").val(item["url_pattern"]);
      $list.find(".background-color").val(item["background_color"]);
      $list.find(".text").val(item["text"]);
      $list.find(".text-color").val(item["text_color"]);
      count++;
    });
    this.m.itemCount = count;
  }

  disableButtons(isDisable) {
    if (isDisable === undefined) isDisable = false;
    let $buttons = $(".button");
    $buttons.each((e) => {
      $($buttons[e]).prop("disabled", isDisable);
    });
  }

  itemHtml_() {
    let $item = $(this.m.$itemList.find("li")[0]);
    return $("<div>").append($item.clone()).html();
  }

  addItem(isAnimation, bindJsColor, backgroundColor, textColor) {
    backgroundColor = backgroundColor || "000000";
    this.m.$itemList.prepend(this.m.itemHtml);
    let $target = this.m.$itemList.find("li:first-child");
    this.show_($target, isAnimation);

    if (bindJsColor) {
      let $list = this.m.$itemList.find("li:first-child");
      new jscolor($list.find(".background-color")[0], {value: backgroundColor});
      new jscolor($list.find(".text-color")[0], {value: textColor});
    }
  }

  removeItem(sender, callback) {
    let $list = $(sender).parents("li");
    this.hide_($list, true, 200, function(){
      $list.remove();
      if (callback) callback();
    });
  }

  resetFileInput() {
    let $fileInput = $("#files").clone();
    $("#files").remove();
    $("#file").append($fileInput);
  }

  updateStateDeleteButton() {
    if (this.m.itemCount <= 1) {
      $("button.delete-button").prop("disabled", true);
    }else{
      $("button.delete-button").prop("disabled", false);
    }
  }

  showColorPreview(sender) {
    let $list = $(sender).parents("li");
    let backgroundColor = $list.find(".background-color").val();
    let text = $list.find(".text").val();
    let textColor = $list.find(".text-color").val();

    let $target = $("div.andon-view");
    $target.css("background-color", "#" + backgroundColor);
    let $text = $target.find("span");
    $text.text(text);
    $text.css("color", "#" + textColor);

    if ($target.css("display") === "none" || $target.css("opacity") < 0.9) {
      this.show_($target, true, 300);
    }
  }

  hideColorPreview(sender) {
    let $target = $("div.andon-view");
    this.hide_($target, true, 300);
  }

  updateLatestUpdateTime(isAnimation) {
    let updateTime = this.m.updateTime();
    let $update_time_text = $("#latest-updated-time");
    if (isAnimation) $update_time_text.hide().fadeIn();
    $update_time_text.text(updateTime);
  }

  downloadExportOptionFile() {
    let url = this.m.downloadUrl;
    let fileName = "andon_options.json";
    var a = document.createElement("a");
    a.download = fileName;
    a.href = url;
    a.click();
  }

  show_($target, isAnimation, time) {
    time = time || 500;
    if (!isAnimation) {
      $target.show();
    }else{
      $target.hide();
      $target.fadeIn(time);
    }
  }

  hide_($target, isAnimation, time, callback) {
    time = time || 500;
    if (!isAnimation) {
      $target.hide();
    }else{
      $target.fadeOut(time, function(){
        if (callback) callback();
      });
    }
  }
}

$(function(){
  let option = new Option();
});

