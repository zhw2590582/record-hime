/*!
 * video-recorder v1.0.0
 * Github: undefined
 * (c) 2018-2019 Harvey Zack
 * Released under the MIT License.
 */

!function(){"use strict";var e=!1;chrome.runtime.onMessage.addListener((function(t){var n=t.type;t.data;switch(n){case"init":if(e)return;e=!0;var c=document.createElement("script");c.src=chrome.extension.getURL("injected/index.js"),document.documentElement.appendChild(c);var i=document.createElement("link");i.rel="stylesheet",i.type="text/css",i.href=chrome.extension.getURL("injected/index.css"),document.head.appendChild(i)}}))}();
