document.addEventListener('DOMContentLoaded', function () {
    // Eventlisteners. Will register when buttons are clicked
    const saveTabsButton = document.getElementById('save-tabs');
    const openFileSelectorButton = document.getElementById('load-tabs');
    const saveTabsSimpleButton = document.getElementById('save-tabsSimple');

    // Will start an event
    openFileSelectorButton.addEventListener('click', openFileSelector);
    saveTabsButton.addEventListener('click', saveTabs);
    saveTabsSimpleButton.addEventListener('click', saveTabs);
});


async function openFileSelector() {
    try {
        // Open the file selector page in a new tab
        await browser.tabs.create({ url: browser.runtime.getURL('file-selector.html') });
        // await browser.tabs.create({ url: 'file-selector.html'});
    } catch (error) {
        console.error('Error opening file selector page:', error);
    }
}



async function saveTabs() {
    // Simple savetabs. Will let background.js know to start
    try {
        // Send a message to the background script
        await browser.runtime.sendMessage({ command: 'saveUrls' });
    } catch (error) {
        console.error('Error saving URLs:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}
