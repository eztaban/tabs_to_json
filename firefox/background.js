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


browser.runtime.onMessage.addListener(async (message) => {
    const standard_filename = "save-tabs"
    
    // Listens for message and checks the content of the message to see what to do
    if (message.command === 'saveUrls') {
        // Simple save URLs
        const currentWindow = await browser.windows.getCurrent();
        const currentTabs = await browser.tabs.query({ windowId: currentWindow.id });
        urls = currentTabs.map(tab => tab.url);

        urls = urls.filter(url => !url.includes('file-selector.html') && !url.includes('moz-extension'));

        // Create a JSON object with the URLs
        const jsonContent = JSON.stringify({ urls }, null, 2);

        // Prompt the user to download the JSON file
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = getTimestamp();
        alert(timestamp)
        browser.downloads.download({ url, filename: `${timestamp}_${standard_filename}.json`});
        alert("u")

        console.log('All URLs saved:', urls);
    }
    if (message.command === 'saveUrlsAdvanced') {
        // With advanced, we utilize the content of the message
    
        // Get the filename and prefixOption from the message
        let { filename, prefixOption, windowOption } = message;
    
        let urls = {};
    
        // Save from all windows
        if (windowOption === "all-windows") {
            const allWindows = await browser.windows.getAll({ populate: true });
            allWindows.forEach(window => {
                urls[window.id] = window.tabs.map(tab => tab.url);
            });
        } else {
            // Only retrieve tabs from current window
            const currentWindow = await browser.windows.getCurrent({ populate: true });
            urls[currentWindow.id] = currentWindow.tabs.map(tab => tab.url);
        }
    
        // Filter out URLs containing specific strings
        for (let windowId in urls) {
            urls[windowId] = urls[windowId].filter(url => !url.includes('file-selector.html') && !url.includes('moz-extension'));
        }
    
        // Create a JSON object with the URLs
        const jsonContent = JSON.stringify(urls, null, 2);
    
        // Handle no filename entered
        filename = filename.trim(); // Remove whitespace from both sides of the string
        if (filename === '') {
            // The input field is empty
            filename = standard_filename; // You should define standard_filename somewhere in your script
            console.log('No filename entered. Using standard filename');
        } else {
            // The input field has some value
            console.log('Filename entered:', filename);
        }
    
        // Construct the filename based on the prefixOption and user input as well as file ending
        let finalFilename = `${filename}.json`;
        if (prefixOption === 'with-prefix') {
            const timestamp = getTimestamp();
            finalFilename = `${timestamp}_${filename}.json`;
        }
    
        // Prompt the user to download the JSON file
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        browser.downloads.download({ url, filename: finalFilename });
    
        console.log('All URLs saved:', urls);
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
