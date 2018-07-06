"use strict";

class Contents {
  constructor() {
    this.m = new ContentsModel();
    this.v = new ContentsView(this.m);
    this.addEvents();
    this.m.updateAndon();
  }

  addEvents() {
    this.m.addEventListener((request, sender, sendResponse) => {
      let event = this.m.eventDispatcher.EVENT;
      switch(request.eventName) {
      case event.SHOW_ANDON:
        this.showAndon(request.option);
        break;
      case event.HIDE_ANDON:
        this.hideAndon();
        break;
      }
    });
  }

  showAndon(option) {
    this.v.showAndon(option);
  }

  hideAndon() {
    this.v.hideAndon();
  }
}

class ContentsModel {
  constructor() {
    this.eventDispatcher = new AndonEventDispatcher();
    this.$target = undefined;
  }

  updateAndon() {
    this.eventDispatcher.dispatchEventUpdateAndon();
  }

  addEventListener(callback) {
    this.eventDispatcher.addEventListener(callback);
  }
}

class ContentsView {
  constructor(model) {
    this.m = model;
  }

  showAndon(option) {
    this.addAndonView();
    this.setOptino(option);
    this.m.$target.fadeIn(200);
  }

  hideAndon() {
    if (this.m.$target) {
      this.m.$target.fadeOut(200);
    }
  }

  setOptino(option) {
    let $target = this.m.$target;
    let backgroundColor = option["background_color"];
    let text = option["text"];
    let textColor = option["text_color"];

    $target.css("background-color", "#" + backgroundColor);
    let $text = $target.find("span");
    $text.text(text);
    $text.css("color", "#" + textColor);
  }

  addAndonView() {
    if (this.m.$target === undefined) {
      let htmlText = "<div class=\"andon-view\" style=\"display: none;\">"+
        "<span class=\"andon-text\"></span>"+
        "</div>";
      $("body").append($(htmlText));
      this.m.$target = $("div.andon-view");
    }
  }
}

(function () {
  let contents = new Contents();
}());
