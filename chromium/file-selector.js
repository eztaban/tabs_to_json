document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('file-input');
    const saveTabsSimpleButton = document.getElementById('save-tabs-simple');
    const saveAdvancedButton = document.getElementById('save-tabsAdvanced');

    fileInput.addEventListener('change', handleFileSelection);
    saveTabsSimpleButton.addEventListener('click', saveTabs);
    saveAdvancedButton.addEventListener('click', saveTabsAdvanced);
});

function handleFileSelection(event) {
    const file = event.target.files[0];
    if (!file) {
        alert('No file selected.');
        console.error('No file selected.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const fileContent = event.target.result;
        processFileContent(fileContent);
    };
    reader.readAsText(file);
}

async function processFileContent(fileContent) {
    try {
        const windowsData = extractUrlsFromJson(fileContent);

        for (const [windowId, urls] of Object.entries(windowsData)) {
            const createdWindow = await chrome.windows.create(); 
            for (const url of urls) {
                try {
                    await chrome.tabs.create({ windowId: createdWindow.id, url, active: false });
                } catch (error) {
                    console.error('Error opening URL: ', url);
                }
            }
            const defaultTab = createdWindow.tabs[0];
            await chrome.tabs.remove(defaultTab.id);
        }

        console.log('Loaded and opened URLs from all windows:', windowsData);
        closeTabWithTitle("File Selector");

    } catch (error) {
        console.error('Error processing file content:', error);
        alert('Failed to process file content:\n' + error.message);
    }
}

function extractUrlsFromJson(jsonContent) {
    try {
        const parsedData = JSON.parse(jsonContent);
        if (typeof parsedData === 'object' && parsedData !== null) {
            const windowsData = {};
            for (const [windowId, urls] of Object.entries(parsedData)) {
                if (Array.isArray(urls)) {
                    windowsData[windowId] = urls.filter(url => typeof url === 'string');
                } else {
                    throw new Error(`Invalid JSON format: URLs array not found for window ${windowId}.`);
                }
            }
            return windowsData;
        } else {
            throw new Error('Invalid JSON format: Expected an object.');
        }
    } catch (error) {
        throw new Error('Error parsing JSON content: ' + error.message);
    }
}

async function closeTabWithTitle(title) {
    const tabs = await chrome.tabs.query({ title: title });

    if (tabs && tabs.length > 0) {
        await chrome.tabs.remove(tabs[0].id);
        console.log('Tab with title', title, 'closed successfully.');
    } else {
        console.log('No tabs with title', title, 'found.');
    }
}

async function saveTabs() {
    try {
        chrome.runtime.sendMessage({ command: 'saveUrls' });
    } catch (error) {
        console.error('Error saving URLs:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}

async function saveTabsAdvanced() {
    try {
        const filenameInput = document.getElementById('filename-input');
        const prefixOption = document.querySelector('input[name="prefix-option"]:checked').value;
        const windowOption = document.querySelector('input[name="window-option"]:checked').value;
        chrome.runtime.sendMessage({ command: 'saveUrlsAdvanced', filename: filenameInput.value, prefixOption: prefixOption, windowOption: windowOption });
    } catch (error) {
        console.error('Error saving URLs:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}
