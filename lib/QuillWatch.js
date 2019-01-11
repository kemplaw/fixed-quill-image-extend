"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QuillWatch = void 0;

var _imgHandler = require("./imgHandler");

/**
 *@description 观察者模式 全局监听富文本编辑器
 */
var QuillWatch = {
  watcher: {},
  // 登记编辑器信息
  active: null,
  // 当前触发的编辑器
  on: function on(imageExtendId, ImageExtend) {
    // 登记注册使用了ImageEXtend的编辑器
    if (!this.watcher[imageExtendId]) {
      this.watcher[imageExtendId] = ImageExtend;
    }
  },
  emit: function emit(activeId) {
    // 事件发射触发
    (0, _imgHandler.imgHandler)();
    this.active = this.watcher[activeId];
  }
};
exports.QuillWatch = QuillWatch;