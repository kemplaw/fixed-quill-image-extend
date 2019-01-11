"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageExtend = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @description 图片功能拓展： 增加上传 拖动 复制
 */
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

    var quillLoading;

    if (this.config.loading) {
      quillLoading = document.querySelector('.quillLoading');

      if (quillLoading === null) {
        quillLoading = document.createElement('div');
        quillLoading.classList.add('quill-loading');
        quillLoading.classList.add('extend-upload-success');
        document.querySelector('.ql-container').appendChild(quillLoading);
      }
    }

    this.quillLoading = quillLoading;
    quill.root.addEventListener('paste', this.pasteHandle.bind(this), false);
    quill.root.addEventListener('drop', this.dropHandle.bind(this), false);
    quill.root.addEventListener('dropover', function (e) {
      e.preventDefault();
    }, false);
    QuillWatch.on(this.id, this);
  }
  /**
   * @description 粘贴
   * @param e
   */


  _createClass(ImageExtend, [{
    key: "pasteHandle",
    value: function pasteHandle(e) {
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

          if (self.config.size && self.file.size >= self.config.size * 1024 * 1024 && self.config.loading) {
            self.quillLoading.classList.remove('extend-upload-success');
            self.quillLoading.classList.add('extend-upload-warning-color');
            self.quillLoading.innerHTML = '图片大小超过限制';
            setTimeout(function () {
              self.quillLoading.classList.remove('extend-upload-warning-color');
              self.quillLoading.classList.add('extend-upload-success');
            }, 1500);
            return;
          }

          if (this.config.action) {
            this.uploadImg();
          } else {
            this.toBase64();
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
      var self = this;
      e.preventDefault(); // 如果图片限制大小

      if (self.config.size && self.file.size >= self.config.size * 1024 * 1024 && self.config.loading) {
        self.quillLoading.classList.add('extend-upload-warning-color');
        self.quillLoading.classList.remove('extend-upload-success');
        self.quillLoading.innerHTML = '图片大小超过限制';
        setTimeout(function () {
          self.quillLoading.classList.remove('extend-upload-warning-color');
          self.quillLoading.classList.add('extend-upload-success');
        }, 1500);
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

      xhr.onload = function (e) {
        if (self.config.loading) {
          setTimeout(function () {
            quillLoading.classList.add('extend-upload-success');
          }, 1000);
        }

        if (xhr.status === 200) {
          self.quill.root.innerHTML = self.quill.root.innerHTML.replace('[uploading...]', '');
          var res = JSON.parse(xhr.responseText);
          self.imgURL = config.response(res);
          self.insertImg();
        } else {
          self.quill.root.innerHTML = self.quill.root.innerHTML.replace('[uploading...]', '[upload error]');
        }
      }; // 开始上传数据


      xhr.upload.onloadstart = function (e) {
        var length = (self.quill.getSelection() || {}).index || self.quill.getLength();
        self.quill.insertText(length, '[uploading...]', {
          'color': 'red'
        }, true);

        if (self.config.loading) {
          quillLoading.classList.remove('extend-upload-success');
        }

        if (config.start) {
          config.start();
        }
      }; // 上传过程


      xhr.upload.onprogress = function (e) {
        var complete = (e.loaded / e.total * 100 | 0) + '%';

        if (self.config.loading) {
          quillLoading.innerHTML = '已上传' + complete;
        }
      }; // 当发生网络异常的时候会触发，如果上传数据的过程还未结束


      xhr.upload.onerror = function (e) {
        self.quill.root.innerHTML = self.quill.root.innerHTML.replace('[uploading...]', '[upload error]');

        if (self.config.loading) {
          self.quillLoading.classList.add('extend-upload-warning-color');
          quillLoading.innerHTML = '网络异常，失败请重试';
          setTimeout(function () {
            self.quillLoading.classList.remove('extend-upload-warning-color');
            quillLoading.classList.add('extend-upload-success');
          }, 1500);
        }

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
      var self = this;
      self.quill.blur();
      var length = (this.quill.getSelection() || {}).index || this.quill.getLength();
      self.quill.insertEmbed(length, 'image', self.imgURL, 'user');
      self.quill.setSelection(length + 1);
    }
  }]);

  return ImageExtend;
}();

exports.ImageExtend = ImageExtend;