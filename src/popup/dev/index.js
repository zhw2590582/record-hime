import './index.scss';

const manifest = chrome.runtime.getManifest();
const $name = document.querySelector('.name');
const $feedback = document.querySelector('.feedback');
const $donate = document.querySelector('.donate');
$name.textContent = `${manifest.name} ${manifest.version}`;
$donate.src = chrome.extension.getURL('icons/donate.png');

$name.addEventListener('click', () => {
    chrome.tabs.create({ url: `https://chrome.google.com/webstore/detail/${chrome.runtime.id}` });
});

$feedback.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/zhw2590582/record-hime' });
});

chrome.tabs.query(
    {
        active: true,
        currentWindow: true,
    },
    tabs => {
        const tab = tabs[0];
        if (tab) {
            chrome.tabs.executeScript(tab.id, {
                file: 'content/index.js',
            });
        }
    },
);
