function getTimestamp() {
    const date = new Date();
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}`;
  }
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const standard_filename = "save-tabs";
  
    if (message.command === 'saveUrls') {
      handleSaveUrls().then(sendResponse).catch(error => {
        console.error('Error in saveUrls:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
  
    if (message.command === 'saveUrlsAdvanced') {
      handleSaveUrlsAdvanced(message).then(sendResponse).catch(error => {
        console.error('Error in saveUrlsAdvanced:', error);
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
  
    return false;
  
    // --- Async Handlers ---
    async function handleSaveUrls() {
        const currentWindow = await chrome.windows.getCurrent({ populate: true });
        const isPrivate = currentWindow.incognito;
        const urls = currentWindow.tabs
          .map(tab => tab.url)
          .filter(url =>
            !url.includes('file-selector.html') &&
            !url.includes('chrome-extension')
          );
      
        const exportData = {
          [currentWindow.id]: {
            windowMode: isPrivate ? "private" : "public",
            urls
          }
        };
      
        const jsonContent = JSON.stringify(exportData, null, 2);
        const filename = `${getTimestamp()}_save-tabs.json`;
        const url = await convertToDataURL(jsonContent);
      
        await chrome.downloads.download({ url, filename });
      
        console.log('✅ Saved in expected format:', exportData);
        return { success: true };
      }
      
      
  
      async function handleSaveUrlsAdvanced(message) {
        let { filename, prefixOption, windowOption } = message;
        filename = filename.trim() || "save-tabs";
      
        const exportData = {};
      
        if (windowOption === "all-windows") {
          const allWindows = await chrome.windows.getAll({ populate: true });
          allWindows.forEach(win => {
            exportData[win.id] = {
              windowMode: win.incognito ? "private" : "public",
              urls: win.tabs
                .map(tab => tab.url)
                .filter(url =>
                  !url.includes('file-selector.html') &&
                  !url.includes('chrome-extension')
                )
            };
          });
        } else {
          const currentWindow = await chrome.windows.getCurrent({ populate: true });
          exportData[currentWindow.id] = {
            windowMode: currentWindow.incognito ? "private" : "public",
            urls: currentWindow.tabs
              .map(tab => tab.url)
              .filter(url =>
                !url.includes('file-selector.html') &&
                !url.includes('chrome-extension')
              )
          };
        }
      
        const jsonContent = JSON.stringify(exportData, null, 2);
        let finalFilename = `${filename}.json`;
        if (prefixOption === 'with-prefix') {
          finalFilename = `${getTimestamp()}_${filename}.json`;
        }
      
        const url = await convertToDataURL(jsonContent);
        await chrome.downloads.download({ url, filename: finalFilename });
      
        console.log('✅ Saved (advanced) in expected format:', exportData);
        return { success: true };
      }
      
  
    async function convertToDataURL(content) {
      const blob = new Blob([content], { type: 'application/json' });
      const arrayBuffer = await blob.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      return `data:application/json;base64,${base64Data}`;
    }
  }

);
  
  chrome.action.onClicked.addListener(async () => {
    try {
      await chrome.tabs.create({ url: chrome.runtime.getURL('file-selector.html') });
    } catch (error) {
      console.error('Error opening file selector page:', error);
    }
  });
  