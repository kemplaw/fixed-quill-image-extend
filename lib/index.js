"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.imgHandler = imgHandler;
exports.container = exports.ImageExtend = exports.QuillWatch = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    // 事件发射触发
    this.active = this.watcher[activeId];

    if (type === 1) {
      imgHandler();
    }
  }
  /**
   * @description 图片功能拓展： 增加上传 拖动 复制
   */

};
exports.QuillWatch = QuillWatch;

var ImageExtend =
/*#__PURE__*/
function () {
  /**
   * @param quill {Quill}富文本实例
   * @param config {Object} options
   * config  keys: action, headers, editForm start end error  size response
   */
  function ImageExtend(quill) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ImageExtend);

    this.id = Math.random();
    this.quill = quill;
    this.quill.id = this.id;
    this.config = config;
    this.file = ''; // 要上传的图片

    this.imgURL = ''; // 图片地址

    quill.root.addEventListener('paste', this.pasteHandle.bind(this), false);
    quill.root.addEventListener('drop', this.dropHandle.bind(this), false);
    quill.root.addEventListener('dropover', function (e) {
      e.preventDefault();
    }, false);
    this.cursorIndex = 0;
    QuillWatch.on(this.id, this);
  }
  /**
   * @description 粘贴
   * @param e
   */


  _createClass(ImageExtend, [{
    key: "pasteHandle",
    value: function pasteHandle(e) {
      // e.preventDefault()
      QuillWatch.emit(this.quill.id, 0);
      var clipboardData = e.clipboardData;
      var i = 0;
      var items, item, types;

      if (clipboardData) {
        items = clipboardData.items;

        if (!items) {
          return;
        }

        item = items[0];
        types = clipboardData.types || [];

        for (; i < types.length; i++) {
          if (types[i] === 'Files') {
            item = items[i];
            break;
          }
        }

        if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
          this.file = item.getAsFile();
          var self = this; // 如果图片限制大小

          if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
            if (self.config.sizeError) {
              self.config.sizeError();
            }

            return;
          }

          if (this.config.action) {// this.uploadImg()
          } else {// this.toBase64()
            }
        }
      }
    }
    /**
     * 拖拽
     * @param e
     */

  }, {
    key: "dropHandle",
    value: function dropHandle(e) {
      QuillWatch.emit(this.quill.id, 0);
      var self = this;
      e.preventDefault(); // 如果图片限制大小

      if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
        if (self.config.sizeError) {
          self.config.sizeError();
        }

        return;
      }

      self.file = e.dataTransfer.files[0]; // 获取到第一个上传的文件对象

      if (this.config.action) {
        self.uploadImg();
      } else {
        self.toBase64();
      }
    }
    /**
     * @description 将图片转为base4
     */

  }, {
    key: "toBase64",
    value: function toBase64() {
      var self = this;
      var reader = new FileReader();

      reader.onload = function (e) {
        // 返回base64
        self.imgURL = e.target.result;
        self.insertImg();
      };

      reader.readAsDataURL(self.file);
    }
    /**
     * @description 上传图片到服务器
     */

  }, {
    key: "uploadImg",
    value: function uploadImg() {
      var self = this;
      var quillLoading = self.quillLoading;
      var config = self.config; // 构造表单

      var formData = new FormData();
      formData.append(config.name, self.file); // 自定义修改表单

      if (config.editForm) {
        config.editForm(formData);
      } // 创建ajax请求


      var xhr = new XMLHttpRequest();
      xhr.open('post', config.action, true); // 如果有设置请求头

      if (config.headers) {
        config.headers(xhr);
      }

      if (config.change) {
        config.change(xhr, formData);
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            //success
            var res = JSON.parse(xhr.responseText);
            self.imgURL = config.response(res);
            QuillWatch.active.uploadSuccess();
            self.insertImg();

            if (self.config.success) {
              self.config.success();
            }
          } else {
            //error
            if (self.config.error) {
              self.config.error();
            }

            QuillWatch.active.uploadError();
          }
        }
      }; // 开始上传数据


      xhr.upload.onloadstart = function (e) {
        QuillWatch.active.uploading(); // let length = (self.quill.getSelection() || {}).index || self.quill.getLength()
        // self.quill.insertText(length, '[uploading...]', { 'color': 'red'}, true)

        if (config.start) {
          config.start();
        }
      }; // 上传过程


      xhr.upload.onprogress = function (e) {
        var complete = (e.loaded / e.total * 100 | 0) + '%';
        QuillWatch.active.progress(complete);
      }; // 当发生网络异常的时候会触发，如果上传数据的过程还未结束


      xhr.upload.onerror = function (e) {
        QuillWatch.active.uploadError();

        if (config.error) {
          config.error();
        }
      }; // 上传数据完成（成功或者失败）时会触发


      xhr.upload.onloadend = function (e) {
        if (config.end) {
          config.end();
        }
      };

      xhr.send(formData);
    }
    /**
     * @description 往富文本编辑器插入图片
     */

  }, {
    key: "insertImg",
    value: function insertImg() {
      var self = QuillWatch.active;
      self.quill.insertEmbed(QuillWatch.active.cursorIndex, 'image', self.imgURL);
      self.quill.update();
      self.quill.setSelection(self.cursorIndex + 1);
    }
    /**
     * @description 显示上传的进度
     */

  }, {
    key: "progress",
    value: function progress(pro) {
      pro = '[' + 'uploading' + pro + ']';
      QuillWatch.active.quill.root.innerHTML = QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, pro);
    }
    /**
     * 开始上传
     */

  }, {
    key: "uploading",
    value: function uploading() {
      var length = (QuillWatch.active.quill.getSelection() || {}).index || QuillWatch.active.quill.getLength();
      QuillWatch.active.cursorIndex = length;
      QuillWatch.active.quill.insertText(QuillWatch.active.cursorIndex, '[uploading...]', {
        'color': 'red'
      }, true);
    }
    /**
     * 上传失败
     */

  }, {
    key: "uploadError",
    value: function uploadError() {
      QuillWatch.active.quill.root.innerHTML = QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, '[upload error]');
    }
  }, {
    key: "uploadSuccess",
    value: function uploadSuccess() {
      QuillWatch.active.quill.root.innerHTML = QuillWatch.active.quill.root.innerHTML.replace(/\[uploading.*?\]/, '');
    }
  }]);

  return ImageExtend;
}();
/**
 * @description 点击图片上传
 */


exports.ImageExtend = ImageExtend;

function imgHandler() {
  var fileInput = document.querySelector('.quill-image-input');

  if (fileInput === null) {
    fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.classList.add('quill-image-input');
    fileInput.style.display = 'none'; // 监听选择文件

    fileInput.addEventListener('change', function () {
      var self = QuillWatch.active;
      self.file = fileInput.files[0];
      fileInput.value = ''; // 如果图片限制大小

      if (self.config.size && self.file.size >= self.config.size * 1024 * 1024) {
        if (self.config.sizeError) {
          self.config.sizeError();
        }

        return;
      }

      if (self.config.action) {
        self.uploadImg();
      } else {
        self.toBase64();
      }
    });
    document.body.appendChild(fileInput);
  }

  fileInput.click();
}
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