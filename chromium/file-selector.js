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

// window and tab functionality

function createWindow(options) {
    return new Promise((resolve, reject) => {
      chrome.windows.create(options, (window) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(window);
        }
      });
    });
  }
  
  function createTab(options) {
    return new Promise((resolve, reject) => {
      chrome.tabs.create(options, (tab) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tab);
        }
      });
    });
  }
  
  function getWindow(windowId) {
    return new Promise((resolve, reject) => {
      chrome.windows.get(windowId, { populate: true }, (window) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(window);
        }
      });
    });
  }
  
  function removeTab(tabId) {
    return new Promise((resolve, reject) => {
      chrome.tabs.remove(tabId, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async function processFileContent(fileContent) {
    try {
      const windowsData = extractUrlsFromJson(fileContent);
  
      for (const windowObj of Object.values(windowsData)) {
        const isPrivate = windowObj.windowMode === 'private';
        const rawUrls = windowObj.urls;
  
        if (!Array.isArray(rawUrls)) {
          console.warn(`Skipped group: missing 'urls' array.`);
          continue;
        }
  
        const urls = rawUrls.filter(url => {
          try {
            new URL(url);
            return true;
          } catch {
            console.warn('Invalid URL skipped:', url);
            return false;
          }
        });
  
        if (urls.length === 0) {
          console.warn('Skipped group: no valid URLs.');
          continue;
        }
  
        console.log(`Opening ${isPrivate ? 'private' : 'public'} window with ${urls.length} tab(s):`, urls);
  
        let createdWindow;
        try {
          createdWindow = await createWindow({
            url: 'https://example.com',
            incognito: isPrivate
          });
          console.log('Created window ID:', createdWindow.id);
        } catch (error) {
          console.error('Failed to create window:', error);
          continue;
        }
  
        for (const url of urls) {
          try {
            const tab = await createTab({
              windowId: createdWindow.id,
              url,
              active: false
            });
            console.log(`Opened tab in window ${createdWindow.id}:`, tab.url);
          } catch (error) {
            console.error(`Failed to open tab for URL ${url}:`, error);
          }
        }
  
        try {
          const windowWithTabs = await getWindow(createdWindow.id);
          const firstTab = windowWithTabs.tabs?.[0];
          if (firstTab?.id) {
            await removeTab(firstTab.id);
            console.log(`Removed initial tab ID ${firstTab.id}`);
          }
        } catch (error) {
          console.warn(`Could not remove initial tab in window ${createdWindow.id}:`, error);
        }
      }
  
      console.log(' All windows and tabs loaded successfully.');
      await closeTabWithTitle("File Selector");
  
    } catch (error) {
      console.error(' Failed to process file content:', error);
      alert('Failed to process file content:\n' + error.message);
    }
  }
  



function extractUrlsFromJson(jsonContent) {
    try {
      const parsedData = JSON.parse(jsonContent);
  
      if (typeof parsedData !== 'object' || parsedData === null) {
        throw new Error('Invalid JSON format: expected a top-level object.');
      }
  
      for (const [windowId, windowObj] of Object.entries(parsedData)) {
        if (
          typeof windowObj !== 'object' ||
          windowObj === null ||
          !Array.isArray(windowObj.urls)
        ) {
          throw new Error(`Invalid JSON format: 'urls' array not found for window ${windowId}.`);
        }
      }
  
      return parsedData; // Return full untouched object
    } catch (error) {
      throw new Error('Error parsing JSON content: ' + error.message);
    }
  }
  
  async function closeTabWithTitle(title) {
    try {
        const allTabs = await chrome.tabs.query({}); // Get all tabs
        const matchingTab = allTabs.find(tab => tab.title === title);

        if (matchingTab && matchingTab.id) {
            await chrome.tabs.remove(matchingTab.id);
            console.log(`Closed tab with title: "${title}"`);
        } else {
            console.log(`No tab found with title: "${title}"`);
        }
    } catch (error) {
        console.error('Failed to close tab by title:', error);
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
