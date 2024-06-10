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
    // Listens for message and checks the content of the message to see what to do
    if (message.command === 'saveUrls') {
        // Simple save URLs
        const allTabs = await browser.tabs.query({});
        const urls = allTabs.map(tab => tab.url);

        // Create a JSON object with the URLs
        const jsonContent = JSON.stringify({ urls }, null, 2);

        // Prompt the user to download the JSON file
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = getTimestamp();
        alert(timestamp)
        browser.downloads.download({ url, filename: `${timestamp}_save-tabs.json`});
        alert("u")

        console.log('All URLs saved:', urls);
    }
    if (message.command === 'saveUrlsAdvanced') {
        // With advanced, we utilize the content of the message
        const allTabs = await browser.tabs.query({});
        const urls = allTabs.map(tab => tab.url);

        // Create a JSON object with the URLs
        const jsonContent = JSON.stringify({ urls }, null, 2);

        // Get the filename and prefixOption from the message
        const { filename, prefixOption } = message;

        // Construct the filename based on the prefixOption and user input as well as file ending
        let finalFilename = `${filename}.json`;
        if (prefixOption === 'with-prefix') {
            const timestamp = getTimestamp();
            finalFilename = `${timestamp}_${filename}`;
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
