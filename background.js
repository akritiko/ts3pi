// Define the CSV header used for storage.
const CSV_HEADER = "URL,Title,Author,CustomCategory,Note\n";

// Helper function to escape CSV fields.
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

// Initialize CSV data in storage if not already present.
function initializeCsv() {
  chrome.storage.local.get(["csvData"], (result) => {
    if (!result.csvData) {
      chrome.storage.local.set({ csvData: CSV_HEADER }, () => {
        console.log("CSV data initialized with header.");
      });
    } else {
      console.log("CSV data already exists.");
    }
  });
}

// CSV-to-JSON conversion function (used by export functionality).
function csvToJSON(csv) {
  let lines = csv.trim().split("\n");
  let result = [];
  if (lines.length < 2) return JSON.stringify(result, null, 2);
  let headers = lines[0].split(",");
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;
    let currentline = lines[i].split(",");
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j] || "";
    }
    result.push(obj);
  }
  return JSON.stringify(result, null, 2);
}

// Convert CSV data to a complete HTML document string (for the "open list" view).
function csvToHtmlTable(csv) {
  let rows = csv.trim().split("\n");
  if (rows.length === 0 || (rows.length === 1 && rows[0].trim() === "")) {
    rows = [CSV_HEADER.trim()];
  }
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ts3pi - bookmarks</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table, th, td { border: 1px solid #000; border-collapse: collapse; padding: 5px; }
    th { cursor: pointer; background-color: #f2f2f2; }
    input { margin: 5px; padding: 5px; }
    #exportButtons { margin-top: 20px; }
    #exportButtons button { margin-right: 10px; padding: 10px; }
    footer { margin-top: 20px; font-size: 0.9em; text-align: center; color: #666; }
  </style>
</head>
<body>
  <h2>ts3pi - bookmarks</h2>
  <div>
    Filter by Author: <input type="text" id="authorFilter" placeholder="Author" onkeyup="filterTable()">
    Filter by Custom Category: <input type="text" id="categoryFilter" placeholder="Custom Category" onkeyup="filterTable()">
  </div>
  <table id="dataTable">
    <thead>
      <tr>`;
  let headerCells = rows[0].split(",");
  for (let i = 0; i < headerCells.length; i++) {
    html += `<th onclick="sortTable(${i})">${headerCells[i]}</th>`;
  }
  html += `</tr>
    </thead>
    <tbody>`;
  for (let r = 1; r < rows.length; r++) {
    if (rows[r].trim() === "") continue;
    let cols = rows[r].split(",");
    html += "<tr>";
    for (let c = 0; c < cols.length; c++) {
      let cell = cols[c];
      if (c === 0) {
        html += `<td><a href="${cell}" target="_blank">${cell}</a></td>`;
      } else {
        html += `<td>${cell}</td>`;
      }
    }
    html += "</tr>";
  }
  html += `</tbody>
  </table>
  
  <!-- Export buttons (visible in the open list view) -->
  <div id="exportButtons">
    <button id="exportCSVBtn">Export CSV</button>
    <button id="exportJSONBtn">Export JSON</button>
    <button id="exportHTMLBtn">Export HTML</button>
  </div>
  
  <script>
    var csvData = ${JSON.stringify(csv)};
    function downloadFile(content, fileName, mimeType) {
      var dataUrl = "data:" + mimeType + ";charset=utf-8," + encodeURIComponent(content);
      var link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    function csvToJSON(csv) {
      var lines = csv.trim().split("\\n");
      var result = [];
      var headers = lines[0].split(",");
      for (var i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "") continue;
        var currentline = lines[i].split(",");
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j] || "";
        }
        result.push(obj);
      }
      return JSON.stringify(result, null, 2);
    }
    function getCleanHTML() {
      var clone = document.documentElement.cloneNode(true);
      var exportButtons = clone.querySelector("#exportButtons");
      if (exportButtons) {
        exportButtons.parentNode.removeChild(exportButtons);
      }
      return clone.outerHTML;
    }
    document.getElementById("exportCSVBtn").addEventListener("click", function(){
      downloadFile(csvData, "list.csv", "text/csv");
    });
    document.getElementById("exportJSONBtn").addEventListener("click", function(){
      var jsonContent = csvToJSON(csvData);
      downloadFile(jsonContent, "list.json", "application/json");
    });
    document.getElementById("exportHTMLBtn").addEventListener("click", function(){
      downloadFile(getCleanHTML(), "list.html", "text/html");
    });
    function sortTable(n) {
      var table = document.getElementById("dataTable"), switching = true, i, x, y, shouldSwitch, dir = "asc", switchcount = 0;
      while (switching) {
        switching = false;
        var rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
          shouldSwitch = false;
          x = rows[i].getElementsByTagName("TD")[n];
          y = rows[i+1].getElementsByTagName("TD")[n];
          if (dir === "asc") {
            if (x.innerText.toLowerCase() > y.innerText.toLowerCase()) {
              shouldSwitch = true;
              break;
            }
          } else if (dir === "desc") {
            if (x.innerText.toLowerCase() < y.innerText.toLowerCase()) {
              shouldSwitch = true;
              break;
            }
          }
        }
        if (shouldSwitch) {
          rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
          switching = true;
          switchcount++;
        } else {
          if (switchcount === 0 && dir === "asc") {
            dir = "desc";
            switching = true;
          }
        }
      }
    }
    function filterTable() {
      var inputAuthor = document.getElementById("authorFilter").value.toLowerCase();
      var inputCategory = document.getElementById("categoryFilter").value.toLowerCase();
      var table = document.getElementById("dataTable");
      var tr = table.getElementsByTagName("tr");
      for (var i = 1; i < tr.length; i++) {
        var tdAuthor = tr[i].getElementsByTagName("td")[2];
        var tdCategory = tr[i].getElementsByTagName("td")[3];
        if (tdAuthor && tdCategory) {
          var txtAuthor = tdAuthor.innerText.toLowerCase();
          var txtCategory = tdCategory.innerText.toLowerCase();
          tr[i].style.display = (txtAuthor.indexOf(inputAuthor) > -1 && txtCategory.indexOf(inputCategory) > -1) ? "" : "none";
        }
      }
    }
  </script>
  
  <footer>
    This browser extension is created by Apostolos Kritikos (c) 2025. Please find more info at 
    <a href="https://www.softwareresilience.com" target="_blank">https://www.softwareresilience.com</a>.
  </footer>
</body>
</html>`;
  
  return html;
}

// Initialize CSV data on install and startup.
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
  initializeCsv();
});
chrome.runtime.onStartup.addListener(() => {
  console.log("Extension startup.");
  initializeCsv();
});

// Listen for messages from the popup or content scripts.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  
  if (message.action === "savePageInfo") {
    const data = message.data;
    // Remove commas from the title field before escaping it.
    const row = [
      escapeCSV(data.url),
      escapeCSV(data.title.replace(/,/g, "")),
      escapeCSV(data.author),
      escapeCSV(data.customCategory),
      escapeCSV(data.note)
    ].join(",") + "\n";
    chrome.storage.local.get(["csvData"], (result) => {
      let csv = result.csvData || CSV_HEADER;
      csv += row;
      chrome.storage.local.set({ csvData: csv }, () => {
        console.log("Page info saved to storage.");
        sendResponse({ status: "Page info saved." });
      });
    });
    return true;
    
  } else if (message.action === "downloadCSV") {
    // This branch remains for backward compatibility.
    chrome.storage.local.get(["csvData"], (result) => {
      const csv = result.csvData || CSV_HEADER;
      const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      chrome.downloads.download({
        url: dataUrl,
        filename: "recorded_pages.csv",
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ status: "Download error: " + chrome.runtime.lastError.message });
        } else {
          sendResponse({ status: "CSV download initiated." });
        }
      });
    });
    return true;
    
  } else if (message.action === "downloadJSON") {
    chrome.storage.local.get(["csvData"], (result) => {
      const csv = result.csvData || CSV_HEADER;
      const jsonContent = csvToJSON(csv);
      const dataUrl = "data:application/json;charset=utf-8," + encodeURIComponent(jsonContent);
      chrome.downloads.download({
        url: dataUrl,
        filename: "recorded_pages.json",
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          sendResponse({ status: "Download error: " + chrome.runtime.lastError.message });
        } else {
          sendResponse({ status: "JSON download initiated." });
        }
      });
    });
    return true;
    
  } else if (message.action === "downloadHTML") {
    chrome.storage.local.get(["csvData"], (result) => {
      const csv = result.csvData || CSV_HEADER;
      const htmlContent = csvToHtmlTable(csv);
      const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
      chrome.tabs.create({ url: dataUrl }, (tab) => {
        if (chrome.runtime.lastError) {
          sendResponse({ status: "Error opening HTML tab: " + chrome.runtime.lastError.message });
        } else {
          sendResponse({ status: "HTML opened in new tab." });
        }
      });
    });
    return true;
    
  } else if (message.action === "importJSON") {
    // Replace the current CSV data with the new CSV from the imported JSON.
    const newCSV = message.newCSV;
    chrome.storage.local.set({ csvData: newCSV }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ status: "Error importing data: " + chrome.runtime.lastError.message });
      } else {
        sendResponse({ status: "List imported successfully." });
      }
    });
    return true;
    
  } else if (message.action === "clearData") {
    chrome.storage.local.set({ csvData: CSV_HEADER }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ status: "Error clearing data: " + chrome.runtime.lastError.message });
      } else {
        sendResponse({ status: "Data cleared. The list of sites is now empty." });
      }
    });
    return true;
  }
});
