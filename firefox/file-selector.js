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
    // This function will process the JSON file with URLs
    try {
        const windowsData = extractUrlsFromJson(fileContent);

        // Open each URL in a separate tab in its respective window
        for (const [windowId, windowData] of Object.entries(windowsData)) {
            const windowMode = windowData.windowMode === 'private';
            const createdWindow = await browser.windows.create({ incognito: windowMode }); // Create a new window with the specified mode
            for (const url of windowData.urls) {
                try {
                    await browser.tabs.create({ windowId: createdWindow.id, url, active: false });
                } catch (error) {
                    // Will happen with illegal URLs
                    console.error('Error opening URL: ', url);
                }
            }
            const defaultTab = createdWindow.tabs[0];
            await browser.tabs.remove(defaultTab.id);
        }

        console.log('Loaded and opened URLs from all windows:', windowsData);
        // Notify that URLs are loaded and close loader tab
        closeTabWithTitle("File Selector");

    } catch (error) {
        console.error('Error processing file content:', error);
        alert('Failed to process file content:\n' + error.message);
    }
}

function extractUrlsFromJson(jsonContent) {
    // Parse JSON data
    try {
        // Try to parse the JSON content
        const parsedData = JSON.parse(jsonContent);

        // Check if the parsed data is an object and not null
        if (typeof parsedData === 'object' && parsedData !== null) {
            const windowsData = {}; // Initialize an empty object to store the window data

            // Iterate over each entry in the parsed data object
            for (const [windowId, windowData] of Object.entries(parsedData)) {

                // Check if windowData is an object, not null, and contains an array of URLs
                if (typeof windowData === 'object' && windowData !== null && Array.isArray(windowData.urls)) {
                    // Store the windowMode and filter the URLs to ensure they are strings
                    windowsData[windowId] = {
                        windowMode: windowData.windowMode, // Preserve the windowMode (private or public)
                        urls: windowData.urls.filter(url => typeof url === 'string') // Ensure URLs are strings
                    };
                } else {
                    // Throw an error if the expected structure is not found
                    throw new Error(`Invalid JSON format: Expected object with windowMode and URLs array for window ${windowId}.`);
                }
            }
            // Return the structured window data
            return windowsData;
        } else {
            // Throw an error if the parsed data is not an object
            throw new Error('Invalid JSON format: Expected an object.');
        }
    } catch (error) {
        // Throw an error if JSON parsing fails
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
        const windowOption = document.querySelector('input[name="window-option"]:checked').value;
        // Send a message to the background script with filename and prefixOption
        await browser.runtime.sendMessage({ command: 'saveUrlsAdvanced', filename: filenameInput.value, prefixOption: prefixOption, windowOption: windowOption});
    } catch (error) {
        console.error('Error saving URLs:', error);
        alert('Failed to save URLs:\n' + error.message);
    }
}