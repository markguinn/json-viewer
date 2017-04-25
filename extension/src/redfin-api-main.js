var chrome = require('chrome-framework');
chrome.devtools.panels.create("Redfin API", "toast.png", "/pages/redfin-api-panel.html", function(panel) {});
