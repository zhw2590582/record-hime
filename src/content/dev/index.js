let isInit = false;
chrome.runtime.onMessage.addListener(request => {
    const { type } = request;
    switch (type) {
        case 'init': {
            if (isInit) return;
            isInit = true;

            const $script = document.createElement('script');
            $script.src = chrome.extension.getURL('injected/index.js');
            document.head.appendChild($script);

            const $style = document.createElement('link');
            $style.rel = 'stylesheet';
            $style.type = 'text/css';
            $style.href = chrome.extension.getURL('injected/index.css');
            document.head.appendChild($style);
            break;
        }
        default:
            break;
    }
});
