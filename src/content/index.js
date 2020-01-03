(function () {
    'use strict';

    if (!document.querySelector('.record-hime')) {
      var $script = document.createElement('script');
      $script.src = chrome.extension.getURL('injected/index.js');
      document.head.appendChild($script);
      var $style = document.createElement('link');
      $style.rel = 'stylesheet';
      $style.type = 'text/css';
      $style.href = chrome.extension.getURL('injected/index.css');
      document.head.appendChild($style);
    }

}());
//# sourceMappingURL=index.js.map
