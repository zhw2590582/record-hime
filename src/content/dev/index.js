if (!document.querySelector('.record-hime')) {
    const $script = document.createElement('script');
    $script.src = chrome.extension.getURL('injected/index.js');
    document.head.appendChild($script);

    const $style = document.createElement('link');
    $style.rel = 'stylesheet';
    $style.type = 'text/css';
    $style.href = chrome.extension.getURL('injected/index.css');
    document.head.appendChild($style);
}
