document.addEventListener('DOMContentLoaded', function () {
    const saveTabsButton = document.getElementById('save-tabs');
    const openFileSelectorButton = document.getElementById('load-tabs');
    const saveTabsSimpleButton = document.getElementById('save-tabsSimple');

    openFileSelectorButton.addEventListener('click', openFileSelector);
    saveTabsButton.addEventListener('click', saveTabs);
    saveTabsSimpleButton.addEventListener('click', saveTabs);
});

async function openFileSelector() {
    try {
        // Open the file selector page in a new tab
        chrome.tabs.create({ url: chrome.runtime.getURL('file-selector.html') });
    } catch (error) {
        console.error('Error opening file selector page:', error);
    }
}

async function saveTabs() {
    try {
        // Send a message to the background script
        chrome.runtime.sendMessage({ command: 'saveUrls' });
    } catch (error) {
        console.error('Error saving URLs:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}
