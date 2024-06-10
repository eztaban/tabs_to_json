document.addEventListener('DOMContentLoaded', function () {
    // Eventlisteners. Will register when buttons are clicked
    const fileInput = document.getElementById('file-input');
    const saveTabsSimpleButton = document.getElementById('save-tabs-simple');
    const saveAdvancedButton = document.getElementById('save-tabsAdvanced');

    // Will start an event
    fileInput.addEventListener('change', handleFileSelection);
    saveTabsSimpleButton.addEventListener('click', saveTabs);
    saveAdvancedButton.addEventListener('click', saveTabsAdvanced)
});

function handleFileSelection(event) {
    // Reads the selected file
    const file = event.target.files[0];
    if (!file) {
        alert('No file selected.');
        console.error('No file selected.');
        return;
    }

    const reader = new FileReader();
    // Here we specify a function that will be called when reader.load is called
    reader.onload = function(event) {
        const fileContent = event.target.result;
        processFileContent(fileContent);
    };
    reader.readAsText(file);
}

async function processFileContent(fileContent) {
    // This function will process the json file with URLs
    try {
        
        const urls = extractUrlsFromJson(fileContent);

        // Open each URL in a separate tab
        for (const url of urls) {
            await browser.tabs.create({ url, active:false});
        }

        console.log('Loaded and opened URLs:', urls);
        // Notify me that URLs are loaded and close loader tab
        alert("URLs succesfully loaded")
        closeTabWithTitle("File Selector")
        

    } catch (error) {
        console.error('Error opening file selector:', error);
        alert('Failed to open file selector:\n' + error.message);
    }
}

function extractUrlsFromJson(jsonContent) {
    // Parse JSON data
    try {
        const parsedData = JSON.parse(jsonContent);
        if (Array.isArray(parsedData.urls)) {
            return parsedData.urls.filter(url => typeof url === 'string');
        } else {
            throw new Error('Invalid JSON format: URLs array not found.');
        }
    } catch (error) {
        throw new Error('Error parsing JSON content: ' + error.message);
    }
}


async function closeTabWithTitle(title) {
    // Query for tabs with the specified title
    const tabs = await browser.tabs.query({ title: title });

    // Check if any tabs with the specified title were found
    if (tabs && tabs.length > 0) {
        // Close the first tab with the specified title
        await browser.tabs.remove(tabs[0].id);
        console.log('Tab with title', title, 'closed successfully.');
    } else {
        console.log('No tabs with title', title, 'found.');
    }
}


async function saveTabs() {
    // This is the simple saveTabs function
    // It is only here to accomodate two UIs - popup and new tab
    // Will also send command for background.js
    try {
        // Send a message to the background script
        await browser.runtime.sendMessage({ command: 'saveUrls' });
    } catch (error) {
        console.error('Error saving URLs:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}

async function saveTabsAdvanced() {
    // Will specify how to save JSON file and send the command for background.js
    try {
        const filenameInput = document.getElementById('filename-input');
        const prefixOption = document.querySelector('input[name="prefix-option"]:checked').value;
        
        // Send a message to the background script with filename and prefixOption
        await browser.runtime.sendMessage({ command: 'saveUrlsAdvanced', filename: filenameInput.value, prefixOption });
    } catch (error) {
        console.error('Error saving URLs:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}