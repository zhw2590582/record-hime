import 'crx-hotreload';

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        tabs => {
            const tab = tabs[0];
            if (tab) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'init',
                });
            }
        },
    );
});
