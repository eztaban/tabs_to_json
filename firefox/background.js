// background.js

function getTimestamp() {
    // Will construct the timestamp when JSON file should be saved with the prefix
    const date = new Date();
    const year = String(date.getFullYear()).slice(2); // Get last two digits of the year
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
}


// Helper function to filter URLs from tabs
function filterUrls(tabs) {
    return tabs.map(tab => tab.url) // Map tabs to their URLs
               .filter(url => !url.includes('file-selector.html') && !url.includes('moz-extension')); // Filter out unwanted URLs
}

// Helper function to construct JSON content from window data
function constructJsonContent(windowData) {
    const jsonData = {}; // Initialize JSON data object
    windowData.forEach(window => {
        jsonData[window.id] = {
            windowMode: window.incognito ? "private" : "public", // Determine window mode
            urls: filterUrls(window.tabs) // Get filtered URLs
        };
    });
    return JSON.stringify(jsonData, null, 2); // Convert object to JSON string with indentation
}

// Helper function to prompt download of JSON file
function promptDownload(jsonContent, filename) {
    const blob = new Blob([jsonContent], { type: 'application/json' }); // Create a Blob from JSON content
    const url = URL.createObjectURL(blob); // Create an object URL for the Blob
    browser.downloads.download({ url, filename }); // Trigger download in browser
}

// Listener for messages sent to the background script
browser.runtime.onMessage.addListener(async (message) => {
    const standardFilename = "save-tabs"; // Default filename

    try {
        let windowData;
        let finalFilename = standardFilename;

        // Get window data based on the command in the message
        if (message.command === 'saveUrls') {
            // Get the current window and its tabs
            const currentWindow = await browser.windows.getCurrent({ populate: true });
            windowData = [currentWindow]; // Wrap single window data in an array



        } else if (message.command === 'saveUrlsAdvanced') {
            const { filename, prefixOption, windowOption } = message; // Destructure advanced options from message

            // Handle filename input
            if (filename.trim() !== '') {
                finalFilename = filename.trim(); // Use provided filename if not empty
            } else {
                console.log('No filename entered. Using standard filename');
            }


            // Get window data based on windowOption
            if (windowOption === "all-windows") {
                windowData = await browser.windows.getAll({ populate: true }); // Get all windows with their tabs
            } else {
                const currentWindow = await browser.windows.getCurrent({ populate: true });
                windowData = [currentWindow]; // Wrap single window data in an array
            }


            // Add prefix to filename if required
            if (prefixOption === 'with-prefix') {
                const timestamp = getTimestamp(); // Generate timestamp
                finalFilename = `${timestamp}_${finalFilename}`; // Prefix filename with timestamp
            }
        } else {
            throw new Error('Unknown command'); // Throw error if command is unrecognized
        }

        // Construct JSON content from window data
        const jsonContent = constructJsonContent(windowData);
        // Prompt download of JSON file
        if (message.command === 'saveUrls'){
            finalFilename = `${getTimestamp()}_${finalFilename}`
        }
        promptDownload(jsonContent, `${finalFilename}.json`);

        console.log('All URLs saved:', windowData); // Log saved URLs for debugging
    } catch (error) {
        console.error('Error saving URLs:', error); // Log error
        alert('Failed to save URLs:\n' + error.message); // Alert user of failure
    }
});


browser.browserAction.onClicked.addListener(async () => {
    try {
        // Open the local file selector page in a new tab
        await browser.tabs.create({ url: browser.runtime.getURL('file-selector.html') });
    } catch (error) {
        console.error('Error opening file selector page:', error);
    }
});
