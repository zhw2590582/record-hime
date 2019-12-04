var videoRecorderInjected = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var createClass = _createClass;

  var Injected =
  /*#__PURE__*/
  function () {
    function Injected() {
      classCallCheck(this, Injected);

      this.blobs = [];
      this.src = '';
      this.timer = null;
      this.video = null;
      this.stream = null;
      this.mediaRecorder = null;
      this.createUI();
      this.bindEvent();
    }

    createClass(Injected, [{
      key: "log",
      value: function log(msg) {
        throw new Error('录播姬 --> ' + msg);
      }
    }, {
      key: "durationToTime",
      value: function durationToTime(duration) {
        var m = String(Math.floor(duration / 60)).slice(-5);
        var s = String(duration % 60);
        return "".concat(m.length === 1 ? "0".concat(m) : m, ":").concat(s.length === 1 ? "0".concat(s) : s);
      }
    }, {
      key: "mergeBlobs",
      value: function mergeBlobs() {
        var _this = this;

        var blobs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var size = this.size;
        return new Promise(function (resolve) {
          var result = blobs.reduce(function (result, item) {
            var blob = new Blob([result, item], {
              type: 'video/webm'
            });
            _this.$wait.textContent = "".concat(Math.floor((blob.size / size || 0) * 100), "%");
            return blob;
          }, new Blob([]));
          resolve(result);
        });
      }
    }, {
      key: "createUI",
      value: function createUI() {
        var _this2 = this;

        this.$container = document.createElement('div');
        this.$container.classList.add('video-recorder');
        this.$container.innerHTML = "\n            <div class=\"vr-states\">\n                <div class=\"vr-state vr-state-before-record vr-active\">\u5F00\u59CB</div>\n                <div class=\"vr-state vr-state-recording\">\u505C\u6B62</div>\n                <div class=\"vr-state vr-state-after-record\">\u4E0B\u8F7D</div>\n                <div class=\"vr-state vr-state-wait\">0%</div>\n            </div>\n            <div class=\"vr-monitors\">\n                <div class=\"vr-monitor vr-monitor-top\">\n                    <div class=\"vr-monitor-name\">\u65F6\u957F\uFF1A</div>\n                    <div class=\"vr-monitor-value vr-duration\">00:00</div>\n                </div>\n                <div class=\"vr-monitor vr-monitor-bottom\">\n                    <div class=\"vr-monitor-name\">\u5927\u5C0F\uFF1A</div>\n                    <div class=\"vr-monitor-value vr-size\">0.00M</div>\n                </div>\n            </div>\n        ";
        this.$states = Array.from(this.$container.querySelectorAll('.vr-state'));
        this.$beforeRecord = this.$container.querySelector('.vr-state-before-record');
        this.$recording = this.$container.querySelector('.vr-state-recording');
        this.$afterRecord = this.$container.querySelector('.vr-state-after-record');
        this.$wait = this.$container.querySelector('.vr-state-wait');
        this.$duration = this.$container.querySelector('.vr-duration');
        this.$size = this.$container.querySelector('.vr-size');
        this.$monitor = this.$container.querySelector('.vr-monitor');
        this.$container.classList.add('vr-focus');
        document.body.appendChild(this.$container);
        setTimeout(function () {
          _this2.$container.classList.remove('vr-focus');
        }, 10000);
      }
    }, {
      key: "bindEvent",
      value: function bindEvent() {
        var _this3 = this;

        this.$beforeRecord.addEventListener('click', function () {
          _this3.start();
        });
        this.$recording.addEventListener('click', function () {
          _this3.stop();
        });
        this.$afterRecord.addEventListener('click', function () {
          _this3.download().then(function () {
            _this3.reset();
          });
        });
        var isDroging = false;
        var lastPageX = 0;
        var lastPageY = 0;
        var lastPlayerLeft = 0;
        var lastPlayerTop = 0;
        this.$monitor.addEventListener('mousedown', function () {
          isDroging = true;
          lastPageX = event.pageX;
          lastPageY = event.pageY;
          lastPlayerLeft = _this3.$container.offsetLeft;
          lastPlayerTop = _this3.$container.offsetTop;
        });
        document.addEventListener('mousemove', function (event) {
          if (isDroging) {
            var x = event.pageX - lastPageX;
            var y = event.pageY - lastPageY;
            _this3.$container.style.transform = "translate(".concat(x, "px, ").concat(y, "px)");
          }
        });
        document.addEventListener('mouseup', function () {
          if (isDroging) {
            isDroging = false;
            _this3.$container.style.transform = 'translate(0, 0)';
            var x = lastPlayerLeft + event.pageX - lastPageX;
            var y = lastPlayerTop + event.pageY - lastPageY;
            _this3.$container.style.left = "".concat(x, "px");
            _this3.$container.style.top = "".concat(y, "px");
          }
        });
      }
    }, {
      key: "start",
      value: function start() {
        var _this4 = this;

        var videos = Array.from(document.querySelectorAll('video'));

        if (videos.length) {
          this.video = videos.find(function (item) {
            return item.captureStream;
          });

          if (this.video) {
            this.src = this.video.src;
            this.changeState('recording');
            this.stream = this.video.captureStream();

            if (MediaRecorder && MediaRecorder.isTypeSupported(Injected.options.mimeType)) {
              this.mediaRecorder = new MediaRecorder(this.stream, Injected.options);

              this.mediaRecorder.ondataavailable = function (event) {
                _this4.blobs.push(event.data);

                var size = _this4.size / 1024 / 1024;
                _this4.$size.textContent = "".concat(size.toFixed(2).slice(-8), "M");
                _this4.$duration.textContent = _this4.durationToTime(_this4.blobs.filter(function (item) {
                  return item.size > 1024;
                }).length);
              };

              this.mediaRecorder.start(1000);
              this.timer = setInterval(function () {
                if (_this4.src !== _this4.video.src) {
                  _this4.stop();
                }
              }, 1000);
            } else {
              this.log('不支持录制格式：' + Injected.options.mimeType);
            }
          } else {
            this.log('未发现视频流');
          }
        } else {
          this.log('未发现视频元素');
        }
      }
    }, {
      key: "stop",
      value: function stop() {
        this.changeState('after-record');
        this.mediaRecorder.stop();
        clearInterval(this.timer);
      }
    }, {
      key: "download",
      value: function download() {
        this.changeState('wait');
        return this.mergeBlobs(this.blobs).then(function (blob) {
          var link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = "".concat(Date.now(), ".webm");
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      }
    }, {
      key: "reset",
      value: function reset() {
        this.changeState('before-record');
        this.blobs = [];
        this.src = '';
        this.timer = null;
        this.video = null;
        this.stream = null;
        this.mediaRecorder = null;
        this.$duration.textContent = '00:00';
        this.$size.textContent = '0.00M';
        this.$wait.textContent = '0%';
      }
    }, {
      key: "changeState",
      value: function changeState(state) {
        this.$states.forEach(function (item) {
          if (item.classList.contains("vr-state-".concat(state))) {
            item.classList.add('vr-active');
          } else {
            item.classList.remove('vr-active');
          }
        });
      }
    }, {
      key: "size",
      get: function get() {
        return this.blobs.reduce(function (size, item) {
          return size + item.size;
        }, 0);
      }
    }], [{
      key: "options",
      get: function get() {
        return {
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 5000000,
          mimeType: 'video/webm; codecs="vp8, opus"'
        };
      }
    }]);

    return Injected;
  }();

  var index = new Injected();

  return index;

}());
//# sourceMappingURL=index.js.map
