/*!
 * record-hime v1.0.1
 * Github: https://github.com/zhw2590582/record-hime
 * (c) 2018-2020 Harvey Zack
 * Released under the MIT License.
 */

!function(){"use strict";var e=chrome.runtime.getManifest(),t=document.querySelector(".name"),c=document.querySelector(".feedback"),n=document.querySelector(".donate");t.textContent="".concat(e.name," ").concat(e.version),n.src=chrome.extension.getURL("icons/donate.png"),t.addEventListener("click",(function(){chrome.tabs.create({url:"https://chrome.google.com/webstore/detail/".concat(chrome.runtime.id)})})),c.addEventListener("click",(function(){chrome.tabs.create({url:"https://github.com/zhw2590582/record-hime"})})),chrome.tabs.query({active:!0,currentWindow:!0},(function(e){var t=e[0];t&&chrome.tabs.executeScript(t.id,{file:"content/index.js"})}))}();
