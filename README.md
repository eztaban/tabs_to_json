# tabs_to_json  

## Introduction
Browser extension that allows user to save tabs to json file and load tabs from json file.

Project currently works for firefox, but the plan is to add support for chromium based browsers.

The browser can be installed from the [firefox extension store](https://addons.mozilla.org/en-US/firefox/addon/save-tabs-to-json/)

## Functionality

This extension allows you to save your tabs from firefox to JSON.  
The URLs of all the open tabs are save in a dictionary format. The structure consist of a key with the windowsID and a nested dictionary. The nested dictionary holds two key-value pairs. One specififying the window mode and one holding a list of urls.  

An example can be seen below:
```JSON
{
  "windowID": {
    "windowMode": "public",
    "urls" :[
      "https://search.brave.com/",
      "https://www.google.com/",
      "https://www.ecosia.org/?c=en",
      "https://www.startpage.com/en/",
      "https://www.wikipedia.org/",
      "https://en.wikipedia.org/wiki/Randomness"
    ]
  }
}
```

### Simple mode
The simple mode is available when the extension is clicked in the toolbar.  
It has two options.  
Pressing *Save URLs* will immediately download a JSON file with the URLs of all open tabs across windows. The file will be prefixed with a datetimestamp of the format `yymmdd_hhmm` with the filename ending with `_save-tabs.json`. 

![Extension popup](/graphics/Screenshot_Extension_Popup.png)

### Advanced mode and loading URLs

Advanced mode supports multiple windows in both loading and saving tabs. The JSON structure is the same, but can hold multiple keys:  
This example will open two windows. One will have 6 tabs, while the other will have 2. The first window is normal, while the second one is private mode.
```JSON
{
  "windowID1": {
    "windowMode": "public",
    "urls" :[
      "https://search.brave.com/",
      "https://www.google.com/",
      "https://www.ecosia.org/?c=en",
      "https://www.startpage.com/en/",
      "https://www.wikipedia.org/",
      "https://en.wikipedia.org/wiki/Randomness"
    ]
  },
  "windowID2": {
    "windowMode": "public",
    "urls" :[
      "https://www.wikipedia.org/",
      "https://en.wikipedia.org/wiki/Randomness"
    ]
  }
}
```

#### Loading
To load URLs that were previously saved with the extension or otherwise, if they follow the same format, select the advanced mode in the popup.  
Then select load JSON. This will open the system file dialog and ask the user to select a file.  
The extension will open a new window per key in the JSON file and open the URLs accordingly.

#### Advanced saving
On this page, it is still possible to do the simple save, which functions as described above.

It is also possible to control the saved file.  
The prefix can be selected or deselected. This will keep or remove the timestamp.  
It is also possible to select whether to store tabs from all windows or only the current window.  
Lastly, it is also possible to give the downloaded file a custom name. The file-ending will be added automatically.

![Advanced mode](/graphics/Screenshot_Advanced_Mode.png)