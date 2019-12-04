/*!
 * record-hime v1.0.2
 * Github: https://github.com/zhw2590582/record-hime
 * (c) 2018-2019 Harvey Zack
 * Released under the MIT License.
 */

!function(){"use strict";var e=!1;chrome.runtime.onMessage.addListener((function(t){switch(t.type){case"init":if(e)return;e=!0;var n=document.createElement("script");n.src=chrome.extension.getURL("injected/index.js"),document.head.appendChild(n);var c=document.createElement("link");c.rel="stylesheet",c.type="text/css",c.href=chrome.extension.getURL("injected/index.css"),document.head.appendChild(c)}}))}();
