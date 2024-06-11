document.addEventListener('DOMContentLoaded', function () {
    const saveTabsButton = document.getElementById('save-tabs');
    const openFileSelectorButton = document.getElementById('load-tabs');
    const saveTabsSimpleButton = document.getElementById('save-tabsSimple');

    openFileSelectorButton.addEventListener('click', openFileSelector);
    saveTabsButton.addEventListener('click', saveTabs);
    saveTabsSimpleButton.addEventListener('click', saveTabs);
});

function openFileSelector() {
    try {
        chrome.tabs.create({ url: chrome.runtime.getURL('file-selector.html') });
    } catch (error) {
        console.error('Error opening file selector page:', error);
    }
}

function saveTabs() {
    try {
        chrome.runtime.sendMessage({ command: 'saveUrls' });
    } catch (error) {
        console.error('Error saving URLs:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}
