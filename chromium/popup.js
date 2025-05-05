document.addEventListener('DOMContentLoaded', function () {
    const saveTabsButton = document.getElementById('save-tabs');
    const openFileSelectorButton = document.getElementById('load-tabs');
    const saveTabsSimpleButton = document.getElementById('save-tabsSimple');

    openFileSelectorButton?.addEventListener('click', openFileSelector);
    saveTabsButton?.addEventListener('click', sendSaveTabsMessage);
    saveTabsSimpleButton?.addEventListener('click', sendSaveTabsMessage);
});

function openFileSelector() {
    try {
        chrome.tabs.create({ url: chrome.runtime.getURL('file-selector.html') });
    } catch (error) {
        console.error('Error opening file selector page:', error);
    }
}

function sendMessage(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

async function sendSaveTabsMessage() {
    try {
        await sendMessage({ command: 'saveUrls' });
        console.log('✅ Message sent to background: saveUrls');
    } catch (error) {
        console.error('❌ Error sending saveUrls message:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}

// function saveTabs() {
//     try {
//         chrome.runtime.sendMessage({ command: 'saveUrls' });
//     } catch (error) {
//         console.error('Error saving URLs:', error);
//         alert('Failed to save URLs:\n' + error.message);
//     }
// }
