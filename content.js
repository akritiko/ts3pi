(function() {
  // Prevent the script from running in iframes.
  if (window.top !== window.self) {
    return;
  }
  
  console.log("content.js injected and running");

  // Gather page information.
  const url = window.location.href;
  const title = document.title || "";
  let author = "";

  // Attempt to get the author from a meta tag.
  const metaAuthor = document.querySelector('meta[name="author"]');
  if (metaAuthor && metaAuthor.content) {
    author = metaAuthor.content;
  }

  // Prompt the user for their custom category and a note.
  let customCategory = prompt("Enter your custom category for this page:", "");
  // If the user cancels or enters an empty string (or whitespace), default to "undefined".
  if (customCategory === null || customCategory.trim() === "") {
    customCategory = "undefined";
  }
  
  let note = prompt("Enter a note for this page:", "");
  if (note === null) {
    note = "";
  }

  // Build a data object with the required info.
  const data = {
    url: url,
    title: title,
    author: author,
    customCategory: customCategory,
    note: note
  };

  console.log("Sending data to background:", data);

  // Send the data to the background script.
  chrome.runtime.sendMessage({ action: "savePageInfo", data: data }, function(response) {
    if (chrome.runtime.lastError) {
      console.error("Error sending message to background:", chrome.runtime.lastError);
    } else {
      console.log("Background response:", response.status);
    }
  });
})();
