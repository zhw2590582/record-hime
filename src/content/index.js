(function () {
    'use strict';

    var isInit = false;
    chrome.runtime.onMessage.addListener(function (request) {
      var type = request.type,
          data = request.data;

      switch (type) {
        case 'init':
          {
            if (isInit) return;
            isInit = true;
            var $script = document.createElement('script');
            $script.src = chrome.extension.getURL('injected/index.js');
            document.documentElement.appendChild($script);
            var $style = document.createElement('link');
            $style.rel = 'stylesheet';
            $style.type = 'text/css';
            $style.href = chrome.extension.getURL('injected/index.css');
            document.head.appendChild($style);
            break;
          }
      }
    });

}());
//# sourceMappingURL=index.js.map
