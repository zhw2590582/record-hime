/*!
 * video-recorder v1.0.0
 * Github: undefined
 * (c) 2018-2019 Harvey Zack
 * Released under the MIT License.
 */

!function(){"use strict";const e=t=>new Promise(r=>t.createReader().readEntries(t=>Promise.all(t.filter(e=>"."!==e.name[0]).map(t=>t.isDirectory?e(t):new Promise(e=>t.file(e)))).then(e=>[].concat(...e)).then(r))),t=(r,n)=>{(t=>e(t).then(e=>e.map(e=>e.name+e.lastModifiedDate).join()))(r).then(e=>{n&&n!==e?chrome.tabs.query({active:!0,currentWindow:!0},e=>{e[0]&&chrome.tabs.reload(e[0].id),chrome.runtime.reload()}):setTimeout(()=>t(r,e),1e3)})};chrome.management.getSelf(e=>{"development"===e.installType&&chrome.runtime.getPackageDirectoryEntry(e=>t(e))}),chrome.browserAction.onClicked.addListener((function(){chrome.tabs.query({active:!0,currentWindow:!0},(function(e){var t=e[0];t&&chrome.tabs.sendMessage(t.id,{type:"init"})}))}))}();
