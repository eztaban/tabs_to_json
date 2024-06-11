function getTimestamp() {
    const date = new Date();
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
}

chrome.runtime.onMessage.addListener(async (message) => {
    const standard_filename = "save-tabs";

    if (message.command === 'saveUrls') {
        const currentWindow = await chrome.windows.getCurrent();
        const currentTabs = await chrome.tabs.query({ windowId: currentWindow.id });
        let urls = currentTabs.map(tab => tab.url);

        urls = urls.filter(url => !url.includes('file-selector.html') && !url.includes('chrome-extension'));

        const jsonContent = JSON.stringify({ urls }, null, 2);

        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = getTimestamp();
        chrome.downloads.download({ url, filename: `${timestamp}_${standard_filename}.json` });

        console.log('All URLs saved:', urls);
    }

    if (message.command === 'saveUrlsAdvanced') {
        let { filename, prefixOption, windowOption } = message;
        let urls = {};

        if (windowOption === "all-windows") {
            const allWindows = await chrome.windows.getAll({ populate: true });
            allWindows.forEach(window => {
                urls[window.id] = window.tabs.map(tab => tab.url);
            });
        } else {
            const currentWindow = await chrome.windows.getCurrent({ populate: true });
            urls[currentWindow.id] = currentWindow.tabs.map(tab => tab.url);
        }

        for (let windowId in urls) {
            urls[windowId] = urls[windowId].filter(url => !url.includes('file-selector.html') && !url.includes('chrome-extension'));
        }

        const jsonContent = JSON.stringify(urls, null, 2);

        filename = filename.trim();
        if (filename === '') {
            filename = standard_filename;
            console.log('No filename entered. Using standard filename');
        } else {
            console.log('Filename entered:', filename);
        }

        let finalFilename = `${filename}.json`;
        if (prefixOption === 'with-prefix') {
            const timestamp = getTimestamp();
            finalFilename = `${timestamp}_${filename}.json`;
        }

        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({ url, filename: finalFilename });

        console.log('All URLs saved:', urls);
    }
});

chrome.browserAction.onClicked.addListener(async () => {
    try {
        await chrome.tabs.create({ url: chrome.runtime.getURL('file-selector.html') });
    } catch (error) {
        console.error('Error opening file selector page:', error);
    }
});
