document.addEventListener("DOMContentLoaded", () => {
  const recordBtn = document.getElementById('recordBtn');
  const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
  const downloadJSONBtn = document.getElementById('downloadJSONBtn');
  const importJSONBtn = document.getElementById('importJSONBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const statusDiv = document.getElementById('status');
  const importFileInput = document.getElementById('importFileInput');

  recordBtn.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length > 0) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          if (chrome.runtime.lastError) {
            statusDiv.textContent = "Error injecting script. Check console.";
          }
        });
      } else {
        statusDiv.textContent = "No active tab found.";
      }
    });
  });

  downloadHtmlBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: "downloadHTML" }, function(response) {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = "Error: " + chrome.runtime.lastError.message;
      } else {
        statusDiv.textContent = response.status;
      }
    });
  });

  downloadJSONBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: "downloadJSON" }, function(response) {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = "Error: " + chrome.runtime.lastError.message;
      } else {
        statusDiv.textContent = response.status;
      }
    });
  });

  importJSONBtn.addEventListener('click', function() {
    // Trigger the hidden file input when Import JSON is clicked.
    importFileInput.click();
  });

  // When a file is selected, read its content.
  importFileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      let jsonStr = e.target.result;
      try {
        const data = JSON.parse(jsonStr);
        // Validate that the JSON is an array of objects with the required keys.
        if (!Array.isArray(data)) {
          alert("Invalid JSON: Expected an array of objects.");
          return;
        }
        const requiredKeys = ["URL", "Title", "Author", "CustomCategory", "Note"];
        for (let item of data) {
          for (let key of requiredKeys) {
            if (!(key in item)) {
              alert("Invalid JSON: Each object must contain the keys: " + requiredKeys.join(", "));
              return;
            }
          }
        }
        // Ask for confirmation.
        if (!confirm("Are you sure you want to proceed? The old list will be lost.")) {
          return;
        }
        // Convert JSON array to CSV.
        let csv = CSV_HEADER; // CSV_HEADER is defined in background.js; we'll duplicate the same header here.
        data.forEach(item => {
          // Use a simple conversion (and escape values that need it).
          csv += requiredKeys.map(key => escapeCSV(item[key])).join(",") + "\n";
        });
        // Send message to background to import the new CSV.
        chrome.runtime.sendMessage({ action: "importJSON", newCSV: csv }, function(response) {
          if (chrome.runtime.lastError) {
            statusDiv.textContent = "Error: " + chrome.runtime.lastError.message;
          } else {
            statusDiv.textContent = response.status;
          }
        });
      } catch (err) {
        alert("Error parsing JSON: " + err.message);
      }
    };
    reader.readAsText(file);
    // Clear the file input for subsequent imports.
    importFileInput.value = "";
  });

  clearDataBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: "clearData" }, function(response) {
      if (chrome.runtime.lastError) {
        statusDiv.textContent = "Error: " + chrome.runtime.lastError.message;
      } else {
        statusDiv.textContent = response.status;
      }
    });
  });
  
  // Define escapeCSV and CSV_HEADER here so we can use them for import conversion.
  // (They should match the ones in background.js.)
  const CSV_HEADER = "URL,Title,Author,CustomCategory,Note\n";
  function escapeCSV(value) {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = value.toString();
    if (/[",\n]/.test(stringValue)) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
  }
});
