(function () {
    'use strict';

    var manifest = chrome.runtime.getManifest();
    var $name = document.querySelector('.name');
    var $feedback = document.querySelector('.feedback');
    var $donate = document.querySelector('.donate');
    $name.textContent = "".concat(manifest.name, " ").concat(manifest.version);
    $donate.src = chrome.extension.getURL('icons/donate.png');
    $name.addEventListener('click', function () {
      chrome.tabs.create({
        url: "https://chrome.google.com/webstore/detail/".concat(chrome.runtime.id)
      });
    });
    $feedback.addEventListener('click', function () {
      chrome.tabs.create({
        url: 'https://github.com/zhw2590582/record-hime'
      });
    });
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      var tab = tabs[0];

      if (tab) {
        chrome.tabs.executeScript(tab.id, {
          file: 'content/index.js'
        });
      }
    });

}());
//# sourceMappingURL=index.js.map
