"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.container = void 0;

/**
 *@description 全部工具栏
 */
var container = [['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'], [{
  'header': 1
}, {
  'header': 2
}], [{
  'list': 'ordered'
}, {
  'list': 'bullet'
}], [{
  'script': 'sub'
}, {
  'script': 'super'
}], [{
  'indent': '-1'
}, {
  'indent': '+1'
}], [{
  'direction': 'rtl'
}], [{
  'size': ['small', false, 'large', 'huge']
}], [{
  'header': [1, 2, 3, 4, 5, 6, false]
}], [{
  'color': []
}, {
  'background': []
}], [{
  'font': []
}], [{
  'align': []
}], ['clean'], ['link', 'image', 'video']];
exports.container = container;